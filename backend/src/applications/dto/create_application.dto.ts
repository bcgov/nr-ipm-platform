import { PickType } from "@nestjs/swagger";
import { ApplicationDto } from "./application.dto";

export class CreateApplicationDto extends PickType(ApplicationDto, [
  "email",
  "username",
] as const) {}
