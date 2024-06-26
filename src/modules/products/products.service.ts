import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/database/prisma.service';

import { ValidSizes, ValidSizesArray, ValidTypes, ValidTypesArray } from '../../types/product.type';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { IErrorImages, IImagesSimpleTable, IProducts } from './interfaces/products.interface';

import { ApiTransactionResponse } from '../../util/ApiResponse';
import { EResponseCodes } from '../../constants/ResponseCodesEnum';
import { CustomError } from '../../helpers/errors/custom.error';
import { MySqlErrorsExceptions } from '../../helpers/errors/exceptions-sql';
import { PageOptionsDto } from 'src/helpers/paginations/dto/page-options.dto';
import { PageDto } from 'src/helpers/paginations/dto/page.dto';

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
    let sizeInvalid: string[] = [];
    for (const iterSizes of applySplitSizes) {
      if( !ValidSizesArray.includes(iterSizes) ){
        sizeInvalid.push(iterSizes);
      }else{
        sizeValid.push(iterSizes);
      }
    }

    if( sizeInvalid.length > 0 ){
      return CustomError.badRequestError(`Las siguientes tallas son inválidas: ${sizeInvalid}`);
    }

    //2. Ajustemos los types
    const getTypesFromRequest = createProductDto.type;
    const applySplitTypes: string[] = getTypesFromRequest.split(',');

    let typeValid: string[] = [];
    let typeInvalid: string[] = [];
    for (const iterTypes of applySplitTypes) {
      if( !ValidTypesArray.includes(iterTypes) ){
        typeInvalid.push(iterTypes);
      }else{
        typeValid.push(iterTypes);
      }
    }

    if( typeInvalid.length > 0 ){
      return CustomError.badRequestError(`Los siguientes tipos son inválidos: ${typeInvalid}`);
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

    //6. Validamos no repetición de name ni slug
    const getProductsByNameAndSlug = await this.prisma.tBL_PRODUCTS.findMany({
      where: {
        OR: [
          { title: createProductDto.title },
          { slug }
        ]
      }
    })

    if( getProductsByNameAndSlug.length > 0 )
      return CustomError.badRequestError(`El nombre/slug ya se encuentra registrado`);

    //7. Validamos existencia de categoría y proveedor
    const getCategory = await this.prisma.tBL_CATEGORIES.findFirst({ where: { id: Number(createProductDto.categoryId) } });
    const getProvider = await this.prisma.tBL_PROVIDERS.findFirst({ where: { id: Number(createProductDto.providerId) } });

    if( !getCategory ) return CustomError.badRequestError(`No existe la categoría que intenta seleccionar`);
    if( !getProvider ) return CustomError.badRequestError(`No existe el proveedor que intenta seleccionar`);

    //8. Guardamos (Solo el producto sin imágenes aún).

    const saveProduct = await this.prisma.tBL_PRODUCTS.create({
      data: {
        description: createProductDto.description,
        inStock: createProductDto.inStock,
        price: createProductDto.price,
        sizes: JSON.stringify(sizeValid), //Se guardan arrays como Strings
        tags: JSON.stringify(tagsValid), //Se guardan arrays como Strings
        colors: JSON.stringify(colorsValid), //Se guardan arrays como Strings
        title: createProductDto.title,
        slug,
        type: JSON.stringify(typeValid), //Se guardan arrays como Strings
        categoryId: Number(createProductDto.categoryId),
        providerId: Number(createProductDto.providerId),
        userCreateAt: "123456789", //TODO: Pendiente del auth
        createDateAt: new Date(),
        userUpdateAt: "123456789", //TODO: Pendiente del auth
        updateDateAt: new Date(),
      }
    })

    return saveProduct;

  }

  async createImages(obj: IImagesSimpleTable): Promise<boolean> {

    const { id, url, productId } = obj;

    const saveImage = await this.prisma.tBL_IMAGES.create({
      data: {
        url,
        productId,
        userCreateAt: "123456789", //TODO: Pendiente de auth
        createDateAt: new Date()
      }
    });

    if( saveImage ) return true;

    return false;

  }

  async findAll(pageOptionsDto: PageOptionsDto): Promise<PageDto<IProducts> | Object> {
    
    throw new Error(`Pendiente de implementación`);
    
  }

  async findOne(id: number): Promise<ApiTransactionResponse<IProducts | string>> {
    
    throw new Error(`Pendiente de implementación`);
    
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<ApiTransactionResponse<IProducts | string>> {
    
    throw new Error(`Pendiente de implementación`);
    
  }

  async remove(id: number): Promise<ApiTransactionResponse<IProducts | string>> {
    
    throw new Error(`Pendiente de implementación`);
    
  }
}
