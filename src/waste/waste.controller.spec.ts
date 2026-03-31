import { Test, TestingModule } from '@nestjs/testing';
import { WasteController } from './waste.controller';

describe('WasteController', () => {
  let controller: WasteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WasteController],
    }).compile();

    controller = module.get<WasteController>(WasteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
