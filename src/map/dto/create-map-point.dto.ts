export class CreateMapPointDto {
  title: string;
  address: string;
  latitude: number;
  longitude: number;
  description?: string;
  isVerified?: boolean;
  
  wasteIds: string[]; 
}