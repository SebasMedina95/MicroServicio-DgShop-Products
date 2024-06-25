import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/database/prisma.service';

import { ValidSizes, ValidSizesArray, ValidTypes, ValidTypesArray } from '../../types/product.type';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { IErrorImages, IProducts } from './interfaces/products.interface';

import { ApiTransactionResponse } from '../../util/ApiResponse';
import { EResponseCodes } from '../../constants/ResponseCodesEnum';
import { CustomError } from '../../helpers/errors/custom.error';
import { MySqlErrorsExceptions } from '../../helpers/errors/exceptions-sql';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');
  private readonly errorsSQL = new MySqlErrorsExceptions();

  constructor(
    private prisma: PrismaService
  ){}

  async create(createProductDto: CreateProductDto): Promise<IProducts | string | CustomError> {

    //1. Ajustemos los sizes 
    const getSizesFromRequest = createProductDto.sizes;
    const applySplitSizes: string[] = getSizesFromRequest.split(',');
    
    let sizeValid: string[] = [];
    for (const iterSizes of applySplitSizes) {
      if( !ValidSizesArray.includes(iterSizes) ){
        sizeValid.push(iterSizes)
      }
    }

    if( sizeValid.length > 0 ){
      return CustomError.badRequestError(`Las siguientes tallas son inválidas: ${sizeValid}`);
    }

    //2. Ajustemos los types
    const getTypesFromRequest = createProductDto.type;
    const applySplitTypes: string[] = getTypesFromRequest.split(',');

    let typeValid: string[] = [];
    for (const iterTypes of applySplitTypes) {
      if( !ValidTypesArray.includes(iterTypes) ){
        typeValid.push(iterTypes)
      }
    }

    if( typeValid.length > 0 ){
      return CustomError.badRequestError(`Los siguientes tipos son inválidos: ${typeValid}`);
    }

    //3. Ajustamos los tags
    const getTagsFromRequest = createProductDto.tags;
    const applySplitTags: string[] = getTagsFromRequest.split(',');

    let tagsValid: string[] = [];
    for (const iterTags of applySplitTags) {
      tagsValid.push(iterTags.toLowerCase());
    }

    //4. Ajustemos los colors
    const getColorsFromRequest = createProductDto.colors;
    const applySplitColors: string[] = getColorsFromRequest.split(',');

    let colorsValid: string[] = [];
    for (const iterColor of applySplitColors) {
      colorsValid.push(iterColor.toLowerCase());
    }

    //5. Ajustamos el slug
    const nameProduct = createProductDto.title;
    let slug: string = nameProduct.toLowerCase();

    slug = slug.replace(/ñ/g, 'n'); // Reemplazar la Ñ y ñ por N y n
    slug = slug.replace(/\s+/g, '_'); // Reemplazar espacios por guiones bajos
    slug = slug.replace(/[^\w_]+/g, ''); // Eliminar todos los caracteres no alfanuméricos excepto guiones bajos
    slug = slug.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Eliminar caracteres especiales (acentos y diacríticos)
    slug = slug.replace(/[^a-z0-9_]/g, ''); // Eliminar carácteres no permitido en URLs que no sean letras, números, o guiones bajos
    slug = slug.replace(/^_+/, ''); // Eliminar guiones bajos al inicio
    slug = slug.replace(/_+$/, ''); // Eliminar guiones bajos al final
    slug = slug.trim(); // Elimino espacios residuales al principio y al final
    console.log({slug});

    //6. Validamos no repetición de name ni slug
    //7. Validamos existencia de categoría y proveedor
    //8. Guardamos.
    
    throw new Error("En proceso de implementación");

  }

  findAll() {
    return `This action returns all products`;
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
