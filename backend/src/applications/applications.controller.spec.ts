import { Test, TestingModule } from "@nestjs/testing";
import { ApplicationsController } from "./applications.controller";
import { ApplicationsService } from "./applications.service";
import request from "supertest";
import { HttpException, INestApplication } from "@nestjs/common";
import { CreateApplicationDto } from "./dto/create_application.dto";
import { UpdateApplicationDto } from "./dto/update_application.dto";
import { ApplicationDto } from "./dto/application.dto";
import { PrismaService } from "../prisma.service";

describe("ApplicationsController", () => {
  let controller: ApplicationsController;
  let applicationsService: ApplicationsService;
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationsController],
      providers: [
        ApplicationsService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();
    applicationsService = module.get<ApplicationsService>(ApplicationsService);
    controller = module.get<ApplicationsController>(ApplicationsController);
    app = module.createNestApplication();
    await app.init();
  });
  // Close the app after each test
  afterEach(async () => {
    await app.close();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("create", () => {
    it("should call the service create method with the given dto and return the result", async () => {
      // Arrange
      const createUserDto: CreateApplicationDto = {
        email: "test@example.com",
        username: "testuser",
      };
      const expectedResult = {
        id: "1",
        ...createUserDto,
      };
      vi.spyOn(applicationsService, "create").mockResolvedValue(expectedResult);

      // Act
      const result = await controller.create(createUserDto);

      // Assert
      expect(applicationsService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe("findAll", () => {
    it("should return an array of applications", async () => {
      const result = [];
      result.push({ id: 1, name: "Alice", email: "test@gmail.com" });
      vi.spyOn(applicationsService, "findAll").mockResolvedValue(result);
      expect(await controller.findAll()).toBe(result);
    });
  });

  describe("findOne", () => {
    it("should return a user object", async () => {
      const result: ApplicationDto = {
        id: "1",
        username: "testuser",
        email: "testuser@example.com",
      };
      vi.spyOn(applicationsService, "findOne").mockResolvedValue(result);
      expect(await controller.findOne("1")).toBe(result);
    });

    it("should throw error if user not found", async () => {
      vi.spyOn(applicationsService, "findOne").mockResolvedValue(undefined);
      try {
        await controller.findOne("1");
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe("Application not found.");
      }
    });
  });

  describe("update", () => {
    it("should update and return a user object", async () => {
      const id = "1";
      const updateUserDto: UpdateApplicationDto = {
        email: "testuser@example.com",
        username: "testuser",
      };
      const userDto: ApplicationDto = {
        id: "1",
        ...updateUserDto,
      };
      vi.spyOn(applicationsService, "update").mockResolvedValue(userDto);

      expect(await controller.update(id, updateUserDto)).toBe(userDto);
      expect(applicationsService.update).toHaveBeenCalledWith(
        id,
        updateUserDto
      );
    });
  });

  describe("remove", () => {
    it("should remove a user", async () => {
      const id = "1";
      vi.spyOn(applicationsService, "remove").mockResolvedValue(undefined);

      expect(await controller.remove(id)).toBeUndefined();
      expect(applicationsService.remove).toHaveBeenCalledWith(id);
    });
  });

  // Test the GET /applications/search endpoint
  describe("GET /applications/search", () => {
    // Test with valid query parameters
    it("given valid query parameters_should return an array of applications with pagination metadata", async () => {
      // Mock the applicationsService.searchApplications method to return a sample result
      const result = {
        applications: [
          { id: "1", username: "alice", email: "alice@example.com" },
          { id: "2", username: "adam", email: "Adam@example.com" },
        ],
        page: 1,
        limit: 10,
        sort: '{"name":"ASC"}',
        filter: '[{"key":"name","operation":"like","value":"A"}]',
        total: 2,
        totalPages: 1,
      };
      vi.spyOn(applicationsService, "searchApplications").mockImplementation(
        async () => result
      );

      // Make a GET request with query parameters and expect a 200 status code and the result object
      return request(app.getHttpServer())
        .get("/applications/search")
        .query({
          page: 1,
          limit: 10,
          sort: '{"name":"ASC"}',
          filter: '[{"key":"username","operation":"like","value":"a"}]',
        })
        .expect(200)
        .expect(result);
    });

    // Test with invalid query parameters
    it("given invalid query parameters_should return a 400 status code with an error message", async () => {
      // Make a GET request with invalid query parameters and expect a 400 status code and an error message
      return request(app.getHttpServer())
        .get("/applications/search")
        .query({
          page: "invalid",
          limit: "invalid",
        })
        .expect(400)
        .expect({
          statusCode: 400,
          message: "Invalid query parameters",
        });
    });

    it("given sort and filter as invalid query parameters_should return a 400 status code with an error message", async () => {
      // Make a GET request with invalid query parameters and expect a 400 status code and an error message
      vi.spyOn(applicationsService, "searchApplications").mockImplementation(
        async () => {
          throw new HttpException("Invalid query parameters", 400);
        }
      );
      return request(app.getHttpServer())
        .get("/applications/search")
        .query({
          page: 1,
          limit: 10,
          sort: "invalid",
          filter: "invalid",
        })
        .expect(400)
        .expect({
          statusCode: 400,
          message: "Invalid query parameters",
        });
    });
  });
});
