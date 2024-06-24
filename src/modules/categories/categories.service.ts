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

    throw new Error("No implementado aún");

  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<ApiTransactionResponse<ICategory | string>> {

    throw new Error("No implementado aún");

  }

  async remove(id: number): Promise<ApiTransactionResponse<ICategory | string>> {

    throw new Error("No implementado aún");

  }

}
