import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";

import { CreateApplicationDto } from "./dto/create_application.dto";
import { UpdateApplicationDto } from "./dto/update_application.dto";
import { ApplicationDto } from "./dto/application.dto";

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  async create(application: CreateApplicationDto): Promise<ApplicationDto> {
    const savedUser = await this.prisma.applications.create({
      data: {
        username: application.username,
        email: application.email,
      },
    });

    return {
      id: savedUser.id,
      username: savedUser.username,
      email: savedUser.email,
    };
  }

  async findAll(): Promise<ApplicationDto[]> {
    const applications = await this.prisma.applications.findMany();
    return applications.flatMap((application) => {
      const applicationDto: ApplicationDto = {
        id: application.id,
        username: application.username,
        email: application.email,
      };
      return applicationDto;
    });
  }

  async findOne(id: string): Promise<ApplicationDto> {
    const application = await this.prisma.applications.findUnique({
      where: {
        id: id,
      },
    });
    return {
      id: application.id,
      username: application.username,
      email: application.email,
    };
  }

  async update(
    id: string,
    updateApplicationDto: UpdateApplicationDto
  ): Promise<ApplicationDto> {
    const user = await this.prisma.applications.update({
      where: {
        id: id,
      },
      data: {
        username: updateApplicationDto.username,
        email: updateApplicationDto.email,
      },
    });
    return {
      id: user.id,
      username: user.username,
      email: user.email,
    };
  }

  async remove(id: string): Promise<{ deleted: boolean; message?: string }> {
    try {
      await this.prisma.applications.delete({
        where: {
          id: id,
        },
      });
      return { deleted: true };
    } catch (err) {
      return { deleted: false, message: err.message };
    }
  }

  async searchApplications(
    page: number,
    limit: number,
    sort: string, // JSON string to store sort key and sort value, ex: [{"name":"desc"},{"email":"asc"}]
    filter: string // JSON array for key, operation and value, ex: [{"key": "name", "operation": "like", "value": "Jo"}]
  ): Promise<any> {
    page = page || 1;
    if (!limit || limit > 200) {
      limit = 10;
    }

    let sortObj = [];
    let filterObj = {};
    try {
      sortObj = JSON.parse(sort);
      filterObj = JSON.parse(filter);
    } catch (e) {
      throw new Error("Invalid query parameters");
    }
    const applications = await this.prisma.applications.findMany({
      skip: (page - 1) * limit,
      take: parseInt(String(limit)),
      orderBy: sortObj,
      where: this.convertFiltersToPrismaFormat(filterObj),
    });

    const count = await this.prisma.applications.count({
      orderBy: sortObj,
      where: this.convertFiltersToPrismaFormat(filterObj),
    });

    return {
      applications: applications,
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    };
  }

  // TODO: come up with a filterObj type.
  public convertFiltersToPrismaFormat(filterObj): any {
    let prismaFilterObj = {};

    for (const item of filterObj) {
      if (item.operation === "like") {
        prismaFilterObj[item.key] = { contains: item.value };
      } else if (item.operation === "eq") {
        prismaFilterObj[item.key] = { equals: item.value };
      } else if (item.operation === "neq") {
        prismaFilterObj[item.key] = { not: { equals: item.value } };
      } else if (item.operation === "gt") {
        prismaFilterObj[item.key] = { gt: item.value };
      } else if (item.operation === "gte") {
        prismaFilterObj[item.key] = { gte: item.value };
      } else if (item.operation === "lt") {
        prismaFilterObj[item.key] = { lt: item.value };
      } else if (item.operation === "lte") {
        prismaFilterObj[item.key] = { lte: item.value };
      } else if (item.operation === "in") {
        prismaFilterObj[item.key] = { in: item.value };
      } else if (item.operation === "notin") {
        prismaFilterObj[item.key] = { not: { in: item.value } };
      } else if (item.operation === "isnull") {
        prismaFilterObj[item.key] = { equals: null };
      }
    }
    return prismaFilterObj;
  }
}
