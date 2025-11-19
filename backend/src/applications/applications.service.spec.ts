import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { ApplicationsService } from "./applications.service";
import { PrismaService } from "../prisma.service";
import { Prisma } from "@prisma/client";
import { application } from "express";

describe("ApplicationsService", () => {
  let service: ApplicationsService;
  let prisma: PrismaService;

  const savedApplication1 = {
    id: "savedApplication1Cuid",
    username: "testNumberOne",
    email: "numone@test.com",
  };
  const savedApplication2 = {
    id: "savedApplication2Cuid",
    username: "testNumberTwo",
    email: "numtwo@test.com",
  };
  const oneApplication = {
    id: "oneApplicationCuid",
    username: "testNumberOne",
    email: "numone@test.com",
  };
  const updateApplication = {
    id: "updateApplicationCuid",
    username: "testNumberOneUpdate",
    email: "numoneupdate@test.com",
  };
  const updatedApplication = {
    id: "updateApplicationCuid",
    username: "testNumberOneUpdate",
    email: "numoneupdate@test.com",
  };

  const twoApplication = {
    id: "twoApplicationCuid",
    username: "testNumberTwo",
    email: "numtwo@test.com",
  };

  const applicationArray = [oneApplication, twoApplication];
  const savedApplicationArray = [savedApplication1, savedApplication2];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        {
          provide: PrismaService,
          useValue: {
            applications: {
              findMany: vi.fn().mockResolvedValue(savedApplicationArray),
              findUnique: vi.fn().mockResolvedValue(savedApplication1),
              create: vi.fn().mockResolvedValue(oneApplication),
              update: vi.fn().mockResolvedValue(updatedApplication),
              delete: vi.fn().mockResolvedValue(true),
              count: vi.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ApplicationsService>(ApplicationsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("createOne", () => {
    it("should successfully add a user", async () => {
      await expect(service.create(oneApplication)).resolves.toEqual(
        oneApplication
      );
      expect(prisma.applications.create).toBeCalledTimes(1);
    });
  });

  describe("findAll", () => {
    it("should return an array of applications", async () => {
      const applications = await service.findAll();
      expect(applications).toEqual(savedApplicationArray);
    });
  });

  describe("findOne", () => {
    it("should get a single application", async () => {
      await expect(service.findOne("savedApplication1Cuid")).resolves.toEqual(
        savedApplication1
      );
    });
  });

  describe("update", () => {
    it("should call the update method", async () => {
      const user = await service.update("updateUserCuid", updateApplication);
      expect(user).toEqual(updateApplication);
      expect(prisma.applications.update).toBeCalledTimes(1);
    });
  });

  describe("remove", () => {
    it("should return {deleted: true}", async () => {
      await expect(service.remove("2")).resolves.toEqual({ deleted: true });
    });
    it("should return {deleted: false, message: err.message}", async () => {
      const repoSpy = vi
        .spyOn(prisma.applications, "delete")
        .mockRejectedValueOnce(new Error("Bad Delete Method."));
      await expect(service.remove("invalidCuid")).resolves.toEqual({
        deleted: false,
        message: "Bad Delete Method.",
      });
      expect(repoSpy).toBeCalledTimes(1);
    });
  });

  describe("searchApplications", () => {
    it("should return a list of applications with pagination and filtering", async () => {
      const page = 1;
      const limit = 10;
      const sortObject: Prisma.SortOrder = "asc";
      const sort: any = `[{ "name": "${sortObject}" }]`;
      const filter: any = '[{ "name": { "equals": "Peter" } }]';

      vi.spyOn(prisma.applications, "findMany").mockResolvedValue([]);
      vi.spyOn(prisma.applications, "count").mockResolvedValue(0);
      const result = await service.searchApplications(
        page,
        limit,
        sort,
        filter
      );

      expect(result).toEqual({
        applications: [],
        page,
        limit,
        total: 0,
        totalPages: 0,
      });
    });

    it("given no page should return a list of applications with pagination and filtering with default page 1", async () => {
      const limit = 10;
      const sortObject: Prisma.SortOrder = "asc";
      const sort: any = `[{ "name": "${sortObject}" }]`;
      const filter: any = '[{ "name": { "equals": "Peter" } }]';

      vi.spyOn(prisma.applications, "findMany").mockResolvedValue([]);
      vi.spyOn(prisma.applications, "count").mockResolvedValue(0);
      const result = await service.searchApplications(
        null,
        limit,
        sort,
        filter
      );

      expect(result).toEqual({
        applications: [],
        page: 1,
        limit,
        total: 0,
        totalPages: 0,
      });
    });
    it("given no limit should return a list of applications with pagination and filtering with default limit 10", async () => {
      const page = 1;
      const sortObject: Prisma.SortOrder = "asc";
      const sort: any = `[{ "name": "${sortObject}" }]`;
      const filter: any = '[{ "name": { "equals": "Peter" } }]';

      vi.spyOn(prisma.applications, "findMany").mockResolvedValue([]);
      vi.spyOn(prisma.applications, "count").mockResolvedValue(0);
      const result = await service.searchApplications(page, null, sort, filter);

      expect(result).toEqual({
        applications: [],
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      });
    });

    it("given  limit greater than 200 should return a list of applications with pagination and filtering with default limit 10", async () => {
      const page = 1;
      const limit = 201;
      const sortObject: Prisma.SortOrder = "asc";
      const sort: any = `[{ "name": "${sortObject}" }]`;
      const filter: any = '[{ "name": { "equals": "Peter" } }]';

      vi.spyOn(prisma.applications, "findMany").mockResolvedValue([]);
      vi.spyOn(prisma.applications, "count").mockResolvedValue(0);
      const result = await service.searchApplications(
        page,
        limit,
        sort,
        filter
      );

      expect(result).toEqual({
        applications: [],
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      });
    });
    it("given  invalid JSON should throw error", async () => {
      const page = 1;
      const limit = 201;
      const sortObject: Prisma.SortOrder = "asc";
      const sort: any = `[{ "name" "${sortObject}" }]`;
      const filter: any = '[{ "name": { "equals": "Peter" } }]';
      try {
        await service.searchApplications(page, limit, sort, filter);
      } catch (e) {
        expect(e).toEqual(new Error("Invalid query parameters"));
      }
    });
  });
  describe("convertFiltersToPrismaFormat", () => {
    it("should convert input filters to prisma's filter format", () => {
      const inputFilter = [
        { key: "a", operation: "like", value: "1" },
        { key: "b", operation: "eq", value: "2" },
        { key: "c", operation: "neq", value: "3" },
        { key: "d", operation: "gt", value: "4" },
        { key: "e", operation: "gte", value: "5" },
        { key: "f", operation: "lt", value: "6" },
        { key: "g", operation: "lte", value: "7" },
        { key: "h", operation: "in", value: ["8"] },
        { key: "i", operation: "notin", value: ["9"] },
        { key: "j", operation: "isnull", value: "10" },
      ];

      const expectedOutput = {
        a: { contains: "1" },
        b: { equals: "2" },
        c: { not: { equals: "3" } },
        d: { gt: "4" },
        e: { gte: "5" },
        f: { lt: "6" },
        g: { lte: "7" },
        h: { in: ["8"] },
        i: { not: { in: ["9"] } },
        j: { equals: null },
      };

      expect(service.convertFiltersToPrismaFormat(inputFilter)).toStrictEqual(
        expectedOutput
      );
    });
  });
});
