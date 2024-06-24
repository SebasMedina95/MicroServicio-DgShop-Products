import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/database/prisma.service';

import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { PageOptionsDto } from '../../helpers/paginations/dto/page-options.dto';
import { PageDto } from '../../helpers/paginations/dto/page.dto';
import { CustomError } from '../../helpers/errors/custom.error';

import { MySqlErrorsExceptions } from '../../helpers/errors/exceptions-sql';
import { ApiTransactionResponse } from '../../util/ApiResponse';

import { IProvider } from './interfaces/providers.interface';

@Injectable()
export class ProvidersService {

  private readonly logger = new Logger('ProvidersService');
  private readonly errorsSQL = new MySqlErrorsExceptions();

  constructor(
    private prisma: PrismaService
  ){}

  async create(createProviderDto: CreateProviderDto): Promise<ApiTransactionResponse<IProvider | CustomError>> {
    
    throw new Error(`Método create sin implementar`);
    
  }

  async findAll(pageOptionsDto: PageOptionsDto): Promise<PageDto<IProvider> | Object> {

    throw new Error(`Método findAll sin implementar`);

  }

  async findOne(id: number): Promise<ApiTransactionResponse<IProvider | string>> {

    throw new Error(`Método findOne sin implementar`);

  }

  async update(id: number, updateProviderDto: UpdateProviderDto): Promise<ApiTransactionResponse<IProvider | string>> {

    throw new Error(`Método update sin implementar`);

  }

  async remove(id: number): Promise<ApiTransactionResponse<IProvider | string>> {

    throw new Error(`Método remove sin implementar`);

  }
}
