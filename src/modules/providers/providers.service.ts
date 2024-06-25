import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/database/prisma.service';

import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { PageOptionsDto } from '../../helpers/paginations/dto/page-options.dto';
import { PageDto } from '../../helpers/paginations/dto/page.dto';
import { PageMetaDto } from '../../helpers/paginations/dto/page-meta.dto';
import { CustomError } from '../../helpers/errors/custom.error';

import { MySqlErrorsExceptions } from '../../helpers/errors/exceptions-sql';
import { ApiTransactionResponse } from '../../util/ApiResponse';
import { EResponseCodes } from '../../constants/ResponseCodesEnum';

import { IProvider } from './interfaces/providers.interface';

@Injectable()
export class ProvidersService {

  private readonly logger = new Logger('ProvidersService');
  private readonly errorsSQL = new MySqlErrorsExceptions();

  constructor(
    private prisma: PrismaService
  ){}

  async create(createProviderDto: CreateProviderDto): Promise<ApiTransactionResponse<IProvider | CustomError>> {
    
    try {
      
      const newProvider = await this.prisma.tBL_PROVIDERS.create({
        data: {
          name: createProviderDto.name,
          address: createProviderDto.address,
          phone1: createProviderDto.phone1.toString(),
          phone2: (createProviderDto.phone2) ? createProviderDto.phone2.toString() : null,
          email1: createProviderDto.email1,
          email2: (createProviderDto.email2) ? createProviderDto.email2 : null,
          description: (createProviderDto.description) ? createProviderDto.description : null,
          userCreateAt: "123456789", //TODO -> Falta el tema de la auth.
          createDateAt: new Date(),
          userUpdateAt: "123456789", //TODO -> Falta el tema de la auth.
          updateDateAt: new Date(),
        }
      })

      return new ApiTransactionResponse(
        newProvider,
        EResponseCodes.OK,
        "Proveedor registrado correctamente."
      );
      
    } catch (error) {

      this.logger.log(`Ocurrió un error al intentar crear el proveedor: ${error}`);
      return new ApiTransactionResponse(
        error,
        EResponseCodes.FAIL,
        "Ocurrió un error al intentar crear el proveedor"
      );
      
    } finally {
      
      this.logger.log(`Creación de proveedor finalizada`);
      await this.prisma.$disconnect();

    }
    
  }

  async findAll(pageOptionsDto: PageOptionsDto): Promise<PageDto<IProvider> | Object> {

    const { take, page, search, order } = pageOptionsDto;
    let getProviders: IProvider[] = [];
    let itemCount: number = 0;

    try {

      if( search && search !== "" && search !== null && search !== undefined ){

        const initialGet = await this.prisma.tBL_PROVIDERS.findMany({
          where: { status: true }
        });
  
        //* Haremos el filtro así porque, el insensitve de prisma para MySQL con Docker toca aplicar otras configuraciones
        const getInitial = initialGet.filter( 
          item => item.name.toLowerCase().includes(search.trim().toLowerCase()) || 
                  (item.description && item.description.toLowerCase().includes(search.trim().toLowerCase())) ||
                  item.address.toLowerCase().includes(search.trim().toLowerCase()) ||
                  item.phone1.toLowerCase().includes(search.trim().toLowerCase()) ||
                  (item.phone2 && item.phone2.toLowerCase().includes(search.trim().toLowerCase())) ||
                  item.email1.toLowerCase().includes(search.trim().toLowerCase()) ||
                  (item.email2 && item.email2.toLowerCase().includes(search.trim().toLowerCase()))  
          );
  
        //* Ahora si apliquemos la paginación y el ordenamiento manualmente.
        const getSort = getInitial.sort((a, b) => {
          if (order === 'asc') {
              return (a.id ?? 0) - (b.id ?? 0);
          } else {
              return (b.id ?? 0) - (a.id ?? 0);
          }
        });
  
        const startIndex: number = (page - 1) * take;
        const endIndex: number = startIndex + take;
  
        getProviders = getSort.slice(startIndex, endIndex);
        itemCount = getInitial.length;
  
      }else{
  
        getProviders = await this.prisma.tBL_PROVIDERS.findMany({
          take,
          skip: Number(page - 1) * take,
          where: { status: true },
          orderBy: { id: order }
        });
  
        itemCount = await this.prisma.tBL_PROVIDERS.count({
          where: { status: true },
        });
  
      }
  
      const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
      return new PageDto(getProviders, pageMetaDto);
      
    } catch (error) {

      this.logger.log(`Ocurrió un error al intentar obtener listado de proveedores: ${error}`);
      return new ApiTransactionResponse(
        error,
        EResponseCodes.FAIL,
        "Ocurrió un error al intentar obtener el listado de proveedores"
      );
      
    } finally {
      
      this.logger.log(`Listado de proveedores finalizada`);
      await this.prisma.$disconnect();

    }

  }

  async findOne(id: number): Promise<ApiTransactionResponse<IProvider | string>> {

    try {
      
      const getProvider = await this.prisma.tBL_PROVIDERS.findFirst({
        where: {
          AND: [
            { id },
            { status: true }
          ]
        }
      });

      if( !getProvider || getProvider == null ){
        return new ApiTransactionResponse(
          null,
          EResponseCodes.FAIL,
          `No pudo ser encontrado un proveedor con el ID ${id}`
        );
      }

      return new ApiTransactionResponse(
        getProvider,
        EResponseCodes.OK,
        `Proveedor obtenido correctamente`
      );
      
    } catch (error) {

      this.logger.log(`Ocurrió un error al intentar obtener un proveedor por su ID: ${error}`);
      return new ApiTransactionResponse(
        error,
        EResponseCodes.FAIL,
        "Ocurrió un error al intentar obtener un proveedor por su ID"
      );
      
    } finally {
      
      this.logger.log(`Obtener proveedor por ID finalizada`);
      await this.prisma.$disconnect();

    }

  }

  async update(id: number, updateProviderDto: UpdateProviderDto): Promise<ApiTransactionResponse<IProvider | string>> {

    try {
      
      //Verificamos que exista el ID solicitado
      const existProviderById = await this.findOne(id);

      if( existProviderById.data == null ){
        return new ApiTransactionResponse(
          null,
          EResponseCodes.FAIL,
          `No pudo ser encontrado un proveedor con el ID ${id}`
        );
      }

      //Llegamos hasta acá, actualizamos entonces:
      const updateProvider = await this.prisma.tBL_PROVIDERS.update({
        where: { id },
        data: {
          name: updateProviderDto.name,
          address: updateProviderDto.address,
          phone1: updateProviderDto.phone1.toString(),
          phone2: (updateProviderDto.phone2) ? updateProviderDto.phone2.toString() : null,
          email1: updateProviderDto.email1,
          email2: (updateProviderDto.email2) ? updateProviderDto.email2 : null,
          description: (updateProviderDto.description) ? updateProviderDto.description : null,
          userUpdateAt: "123456789", //TODO -> Falta el tema de la auth.
          updateDateAt: new Date(),
        }
      });

      return new ApiTransactionResponse(
        updateProvider,
        EResponseCodes.OK,
        "Proveedor actualizado correctamente"
      );

    } catch (error) {

      this.logger.log(`Ocurrió un error al intentar actualizar el proveedor: ${error}`);
      return new ApiTransactionResponse(
        error,
        EResponseCodes.FAIL,
        "Ocurrió un error al intentar actualizar el proveedor"
      );
      
    } finally {
      
      this.logger.log(`Actualización de proveedor finalizada`);
      await this.prisma.$disconnect();

    }

  }

  async remove(id: number): Promise<ApiTransactionResponse<IProvider | string>> {

    try {

      //Verificamos que exista el ID solicitado
      const existProviderById = await this.findOne(id);

      if( existProviderById.data == null ){
        return new ApiTransactionResponse(
          null,
          EResponseCodes.FAIL,
          `No pudo ser encontrado un proveedor con el ID ${id}`
        );
      }

      //Llegamos hasta acá, actualizamos entonces:
      const updateProvider = await this.prisma.tBL_PROVIDERS.update({
        where: { id },
        data: {
          status: false,
          userUpdateAt: "123456789", //TODO -> Falta el tema de la auth.
          updateDateAt: new Date(),
        }
      });

      return new ApiTransactionResponse(
        updateProvider,
        EResponseCodes.OK,
        "Proveedor eliminado correctamente"
      );
      
    } catch (error) {
      
    }
    

  }
}
