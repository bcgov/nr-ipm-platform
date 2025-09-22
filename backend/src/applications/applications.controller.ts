import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  HttpException,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ApplicationsService } from "./applications.service";
import { CreateApplicationDto } from "./dto/create_application.dto";
import { UpdateApplicationDto } from "./dto/update_application.dto";
import { ApplicationDto } from "./dto/application.dto";

@ApiTags("applications")
@Controller({ path: "applications", version: "1" })
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  create(@Body() createApplicationDto: CreateApplicationDto) {
    return this.applicationsService.create(createApplicationDto);
  }

  @Get()
  findAll(): Promise<ApplicationDto[]> {
    return this.applicationsService.findAll();
  }

  @Get("search") // it must be ahead of the below Get(":id") to avoid conflict
  async searchApplications(
    @Query("page") page: number,
    @Query("limit") limit: number,
    @Query("sort") sort: string, // JSON string to store sort key and sort value, ex: {name: "ASC"}
    @Query("filter") filter: string // JSON array for key, operation and value, ex: [{key: "name", operation: "like", value: "Peter"}]
  ) {
    if (isNaN(page) || isNaN(limit)) {
      throw new HttpException("Invalid query parameters", 400);
    }
    return this.applicationsService.searchApplications(
      page,
      limit,
      sort,
      filter
    );
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    const application = await this.applicationsService.findOne(id);
    if (!application) {
      throw new HttpException("Application not found.", 404);
    }
    return application;
  }

  @Put(":id")
  update(
    @Param("id") id: string,
    @Body() updateApplicationDto: UpdateApplicationDto
  ) {
    return this.applicationsService.update(id, updateApplicationDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.applicationsService.remove(id);
  }
}
