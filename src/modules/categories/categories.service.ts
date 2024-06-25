import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/database/prisma.service';

import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PageDto } from '../../helpers/paginations/dto/page.dto';
import { PageOptionsDto } from '../../helpers/paginations/dto/page-options.dto';
import { PageMetaDto } from '../../helpers/paginations/dto/page-meta.dto';
import { CustomError } from '../../helpers/errors/custom.error';

import { MySqlErrorsExceptions } from '../../helpers/errors/exceptions-sql';
import { ApiTransactionResponse } from '../../util/ApiResponse';
import { EResponseCodes } from '../../constants/ResponseCodesEnum';
import { ICategory } from './interfaces/categories.interfaces';

@Injectable()
export class CategoriesService {

  private readonly logger = new Logger('CategoriesService');
  private readonly errorsSQL = new MySqlErrorsExceptions();

  constructor(
    private prisma: PrismaService
  ){}

  async create(createCategoryDto: CreateCategoryDto): Promise<ApiTransactionResponse<ICategory | CustomError>> {

    const { name, description } = createCategoryDto;

    try {
      
      const existCategory = await this.prisma.tBL_CATEGORIES.findMany({
        where: { name }
      })

      if( existCategory.length > 0 ){
        return new ApiTransactionResponse(
          null,
          EResponseCodes.FAIL,
          "La categoría ya se encuentra registrada en la base de datos."
        );
      }

      const newCategory = await this.prisma.tBL_CATEGORIES.create({
        data: {
          name,
          description,
          userCreateAt: "123456789", //TODO -> Falta el tema de la auth.
          createDateAt: new Date(),
          userUpdateAt: "123456789", //TODO -> Falta el tema de la auth.
          updateDateAt: new Date(),
        }
      })

      return new ApiTransactionResponse(
        newCategory,
        EResponseCodes.OK,
        "Categoría registrada correctamente."
      );

    } catch (error) {

      this.logger.log(`Ocurrió un error al intentar crear la categoría: ${error}`);
      return new ApiTransactionResponse(
        error,
        EResponseCodes.FAIL,
        "Ocurrió un error al intentar crear la categoría"
      );
      
    } finally {
      
      this.logger.log(`Creación de categoría finalizada`);
      await this.prisma.$disconnect();

    }

  }

  async findAll(pageOptionsDto: PageOptionsDto): Promise<PageDto<ICategory> | Object> {

    const { take, page, search, order } = pageOptionsDto;
    let getCategories: ICategory[] = [];
    let itemCount: number = 0;

    try {

      //Si vamos a realizar además de la paginación una búsqueda
      if( search && search !== "" && search !== null && search !== undefined ){

        const initialGet = await this.prisma.tBL_CATEGORIES.findMany({
          where: { status: true }
        });

        //* Haremos el filtro así porque, el insensitve de prisma para MySQL con Docker toca aplicar otras configuraciones
        const getInitial = initialGet.filter( 
            item => item.name.toLowerCase().includes(search.trim().toLowerCase()) || 
                    item.description.toLowerCase().includes(search.trim().toLowerCase()));

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

        getCategories = getSort.slice(startIndex, endIndex);
        itemCount = getInitial.length;

      //El listado va derechito
      }else{
  
        getCategories = await this.prisma.tBL_CATEGORIES.findMany({
          take,
          skip: Number(page - 1) * take,
          where: { status: true },
          orderBy: { id: order }
        });

        itemCount = await this.prisma.tBL_CATEGORIES.count({
          where: { status: true },
        });

      }

      const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
      return new PageDto(getCategories, pageMetaDto);
      
    } catch (error) {

      this.logger.log(`Ocurrió un error al intentar obtener listado de categorías: ${error}`);
      return new ApiTransactionResponse(
        error,
        EResponseCodes.FAIL,
        "Ocurrió un error al intentar obtener el listado de categorías"
      );
      
    } finally {
      
      this.logger.log(`Listado de categorías finalizada`);
      await this.prisma.$disconnect();

    }

  }

  async findOne(id: number): Promise<ApiTransactionResponse<ICategory | string>> {

    try {
      
      const getCategory = await this.prisma.tBL_CATEGORIES.findFirst({
        where: {
          AND: [
            { id },
            { status: true }
          ]
        }
      });

      if( !getCategory || getCategory == null ){
        return new ApiTransactionResponse(
          null,
          EResponseCodes.FAIL,
          `No pudo ser encontrado una categoría con el ID ${id}`
        );
      }

      return new ApiTransactionResponse(
        getCategory,
        EResponseCodes.OK,
        `Categoría obtenida correctamente`
      );

    } catch (error) {

      this.logger.log(`Ocurrió un error al intentar obtener una categoría por su ID: ${error}`);
      return new ApiTransactionResponse(
        error,
        EResponseCodes.FAIL,
        "Ocurrió un error al intentar obtener una categoría por su ID"
      );
      
    } finally {
      
      this.logger.log(`Obtener categoría por ID finalizada`);
      await this.prisma.$disconnect();

    }

  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<ApiTransactionResponse<ICategory | string>> {

    try {
      
      //Verificamos que exista el ID solicitado
      const existCategoryById = await this.findOne(id);

      if( existCategoryById.data == null ){
        return new ApiTransactionResponse(
          null,
          EResponseCodes.FAIL,
          `No pudo ser encontrado una categoría con el ID ${id}`
        );
      }

      //Verificamos que no se repita el nombre que es Unique
      const existCategoryByName = await this.prisma.tBL_CATEGORIES.findFirst({
        where: { name: updateCategoryDto.name.trim().toUpperCase() }
      });

      if( existCategoryByName ){
        if( existCategoryByName.id != id ){
          return new ApiTransactionResponse(
            null,
            EResponseCodes.FAIL,
            `Ya existe el nombre de la categoría`
          );
        }
      }

      //Llegamos hasta acá, actualizamos entonces:
      const updateCategory = await this.prisma.tBL_CATEGORIES.update({
        where: { id },
        data: {
          name: updateCategoryDto.name,
          description: updateCategoryDto.description,
          userUpdateAt: "123456789", //TODO -> Falta el tema de la auth.
          updateDateAt: new Date(),
        }
      });

      return new ApiTransactionResponse(
        updateCategory,
        EResponseCodes.OK,
        "Categoría actualizada correctamente"
      );

    } catch (error) {

      this.logger.log(`Ocurrió un error al intentar actualizar la categoría: ${error}`);
      return new ApiTransactionResponse(
        error,
        EResponseCodes.FAIL,
        "Ocurrió un error al intentar actualizar la categoría"
      );
      
    } finally {
      
      this.logger.log(`Actualización de categoría finalizada`);
      await this.prisma.$disconnect();

    }

  }

  async remove(id: number): Promise<ApiTransactionResponse<ICategory | string>> {

    try {
      
      //Verificamos que exista el ID solicitado
      const existCategoryById = await this.findOne(id);

      if( existCategoryById.data == null ){
        return new ApiTransactionResponse(
          null,
          EResponseCodes.FAIL,
          `No pudo ser encontrado una categoría con el ID ${id}`
        );
      }

      //Llegamos hasta acá, actualizamos entonces:
      const updateCategory = await this.prisma.tBL_CATEGORIES.update({
        where: { id },
        data: {
          status: false,
          userUpdateAt: "123456789", //TODO -> Falta el tema de la auth.
          updateDateAt: new Date(),
        }
      });

      return new ApiTransactionResponse(
        updateCategory,
        EResponseCodes.OK,
        "Categoría eliminada correctamente"
      );
      
    } catch (error) {

      this.logger.log(`Ocurrió un error al intentar eliminar lógicamente la categoría: ${error}`);
      return new ApiTransactionResponse(
        error,
        EResponseCodes.FAIL,
        "Ocurrió un error al intentar eliminar lógicamente la categoría"
      );
      
    } finally {
      
      this.logger.log(`Creación de categoría finalizada`);
      await this.prisma.$disconnect();

    }

  }

}
