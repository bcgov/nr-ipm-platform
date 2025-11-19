import { ApiProperty } from "@nestjs/swagger";

export class ApplicationDto {
  @ApiProperty({
    description: "The ID of the user",
  })
  id: string;

  @ApiProperty({
    description: "The user name of the user",
  })
  username: string;

  @ApiProperty({
    description: "The contact email of the user",
    default: "",
  })
  email: string;
}
