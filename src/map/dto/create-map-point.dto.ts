import { PointType } from "prisma/generated/enums";

export class CreateMapPointDto {
  title: string;
  address: string;
  latitude: number;
  longitude: number;
  description?: string;
  isVerified?: boolean;
  type?: PointType
  
  wasteIds: string[]; 
}