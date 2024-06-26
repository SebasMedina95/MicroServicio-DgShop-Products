import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/database/prisma.service';

import { ValidSizes,
         ValidSizesArray,
         ValidTypes,
         ValidTypesArray } from '../../types/product.type';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PageMetaDto } from '../../helpers/paginations/dto/page-meta.dto';
import { PageDto } from '../../helpers/paginations/dto/page.dto';
import { PageOptionsDto } from '../../helpers/paginations/dto/page-options.dto';

import { IErrorImages, 
         IImagesSimpleTable, 
         IProducts } from './interfaces/products.interface';

import { ApiTransactionResponse } from '../../util/ApiResponse';
import { EResponseCodes } from '../../constants/ResponseCodesEnum';
import { CustomError } from '../../helpers/errors/custom.error';
import { MySqlErrorsExceptions } from '../../helpers/errors/exceptions-sql';
import { Image } from './entities/image.entity';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');
  private readonly errorsSQL = new MySqlErrorsExceptions();

  constructor(
    private prisma: PrismaService
  ){}

  async create(createProductDto: CreateProductDto): Promise<IProducts | string | CustomError> {

    try {

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
      
    } catch (error) {

      this.logger.log(`Ocurrió un error al intentar crear el producto: ${error}`);
      return CustomError.internalServerError(`Error fatal, transacción fallida`);
      
    } finally {
      
      this.logger.log(`Creación de producto finalizada`);
      await this.prisma.$disconnect();

    }

  }

  async createImages(obj: IImagesSimpleTable): Promise<boolean> {

    const { url, productId } = obj;

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
    
    const { take, page, search, order } = pageOptionsDto;
    let getProducts: IProducts[] = [];
    let itemCount: number = 0;

    try {

      //Si vamos a realizar además de la paginación una búsqueda
      if( search && search !== "" && search !== null && search !== undefined ){

        const initialGet = await this.prisma.tBL_PRODUCTS.findMany({
          where: { status: true },
          include: {
            category: true,
            provider: true,
            TBL_IMAGES: true
          }
        });

        // Transformar los campos de strings a arrays
        if (initialGet && initialGet.length > 0) {
          initialGet.forEach(product => {
            product.sizes = JSON.parse(product.sizes);
            product.tags = JSON.parse(product.tags);
            product.colors = JSON.parse(product.colors);
            product.type = JSON.parse(product.type);
          });
        }

        //* Haremos el filtro así porque, el insensitve de prisma para MySQL con Docker toca aplicar otras configuraciones
        const getInitial = initialGet.filter( 
          item => item.title.toLowerCase().includes(search.trim().toLowerCase()) || 
                  item.description.toLowerCase().includes(search.trim().toLowerCase()) ||
                  item.slug.toLowerCase().includes(search.trim().toLowerCase()) ||
                  item.category.name.toLowerCase().includes(search.trim().toLowerCase()) ||
                  item.provider.name.toLowerCase().includes(search.trim().toLowerCase())
                  
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

        getProducts = getSort.slice(startIndex, endIndex);
        itemCount = getInitial.length;


      }else{

        getProducts = await this.prisma.tBL_PRODUCTS.findMany({
          take,
          skip: Number(page - 1) * take,
          where: { status: true },
          include: {
            category: true,
            provider: true,
            TBL_IMAGES: true
          },
          orderBy: { id: order }
        });

        // Transformar los campos de strings a arrays
        if (getProducts && getProducts.length > 0) {
          getProducts.forEach(product => {
            product.sizes = JSON.parse(product.sizes);
            product.tags = JSON.parse(product.tags);
            product.colors = JSON.parse(product.colors);
            product.type = JSON.parse(product.type);
          });
        }

        itemCount = await this.prisma.tBL_CATEGORIES.count({
          where: { status: true },
        });

      }

      const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
      return new PageDto(getProducts, pageMetaDto);
      
    } catch (error) {

      this.logger.log(`Ocurrió un error al intentar obtener listado de productos: ${error}`);
      return new ApiTransactionResponse(
        error,
        EResponseCodes.FAIL,
        "Ocurrió un error al intentar obtener el listado de productos"
      );
      
    } finally {
      
      this.logger.log(`Listado de productos finalizada`);
      await this.prisma.$disconnect();

    }
    
  }

  async findOne(id: number): Promise<ApiTransactionResponse<IProducts | string>> {
    
    try {
      
      const getProduct = await this.prisma.tBL_PRODUCTS.findFirst({
        where: {
          AND: [
            { id },
            { status: true }
          ]
        },
        include: {
          category: true,
          provider: true,
          TBL_IMAGES: true,
        }
      });

      if( !getProduct || getProduct == null ){
        return new ApiTransactionResponse(
          null,
          EResponseCodes.FAIL,
          `No pudo ser encontrado un proveedor con el ID ${id}`
        );
      }

      //Convertimos en arreglos para facilitar el front.
      getProduct.sizes = JSON.parse(getProduct.sizes);
      getProduct.tags = JSON.parse(getProduct.tags);
      getProduct.colors = JSON.parse(getProduct.colors);
      getProduct.type = JSON.parse(getProduct.type);

      return new ApiTransactionResponse(
        getProduct,
        EResponseCodes.OK,
        `Producto obtenido correctamente`
      );
      
    } catch (error) {

      this.logger.log(`Ocurrió un error al intentar obtener un producto por su ID: ${error}`);
      return new ApiTransactionResponse(
        error,
        EResponseCodes.FAIL,
        "Ocurrió un error al intentar obtener un producto por su ID"
      );
      
    } finally {
      
      this.logger.log(`Obtener producto por ID finalizada`);
      await this.prisma.$disconnect();

    }
    
  }

  async imagesByProduct(id: number): Promise<Image[]> {

    const getImages = await this.prisma.tBL_IMAGES.findMany({
      where: { productId: id }
    });

    return getImages;

  }

  async deleteImagesByProduct(id: number): Promise<boolean> {

    const deleteImages = await this.prisma.tBL_IMAGES.deleteMany({
      where: { productId: id }
    });

    if( deleteImages ) return true

    return false;

  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<IProducts | string | CustomError> {
    
    try {
      
      //Verificamos que exista el ID solicitado
      const existProductById = await this.findOne(id);

      if( existProductById.data == null )
        return CustomError.badRequestError(`Producto no encontrado`);

      //1. Ajustemos los sizes 
      const getSizesFromRequest = updateProductDto.sizes;
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
      const getTypesFromRequest = updateProductDto.type;
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
      const getTagsFromRequest = updateProductDto.tags;
      const applySplitTags: string[] = getTagsFromRequest.split(',');

      let tagsValid: string[] = [];
      for (const iterTags of applySplitTags) {
        tagsValid.push(iterTags.toLowerCase());
      }

      //4. Ajustemos los colors
      const getColorsFromRequest = updateProductDto.colors;
      const applySplitColors: string[] = getColorsFromRequest.split(',');

      let colorsValid: string[] = [];
      for (const iterColor of applySplitColors) {
        colorsValid.push(iterColor.toLowerCase());
      }

      //Verificamos que no se repita el nombre que es Unique, lo haremos por el Slug generado
      const nameProduct = updateProductDto.title;
      let slug: string = nameProduct.toLowerCase();

      slug = slug.replace(/ñ/g, 'n'); // Reemplazar la Ñ y ñ por N y n
      slug = slug.replace(/\s+/g, '_'); // Reemplazar espacios por guiones bajos
      slug = slug.replace(/[^\w_]+/g, ''); // Eliminar todos los caracteres no alfanuméricos excepto guiones bajos
      slug = slug.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Eliminar caracteres especiales (acentos y diacríticos)
      slug = slug.replace(/[^a-z0-9_]/g, ''); // Eliminar carácteres no permitido en URLs que no sean letras, números, o guiones bajos
      slug = slug.replace(/^_+/, ''); // Eliminar guiones bajos al inicio
      slug = slug.replace(/_+$/, ''); // Eliminar guiones bajos al final
      slug = slug.trim(); // Elimino espacios residuales al principio y al final

      const existProductByName = await this.prisma.tBL_PRODUCTS.findFirst({
        where: {
          OR: [
            { title: updateProductDto.title.trim().toUpperCase() },
            { slug }
          ]
        }
      });

      if( existProductByName ){
        if( existProductByName.id != id ){
          return CustomError.badRequestError(`Se esta intentando registrar un nombre de producto que ya se encuentra`);
        }
      }

      //Actualizamos
      const updateProduct = await this.prisma.tBL_PRODUCTS.update({
        where: { id },
        data: {
          description: updateProductDto.description,
          inStock: updateProductDto.inStock,
          price: updateProductDto.price,
          sizes: JSON.stringify(sizeValid), //Se guardan arrays como Strings
          tags: JSON.stringify(tagsValid), //Se guardan arrays como Strings
          colors: JSON.stringify(colorsValid), //Se guardan arrays como Strings
          title: updateProductDto.title,
          slug,
          type: JSON.stringify(typeValid), //Se guardan arrays como Strings
          categoryId: Number(updateProductDto.categoryId),
          providerId: Number(updateProductDto.providerId),
          userUpdateAt: "123456789", //TODO: Pendiente del auth
          updateDateAt: new Date()
        }
      });

      return updateProduct;
      
    } catch (error) {

      this.logger.log(`Ocurrió un error al intentar actualizar el producto: ${error}`);
      return CustomError.badRequestError(`Error al intentar actualizar el producto`);
      
    } finally {
      
      this.logger.log(`Actualización de producto finalizada`);
      await this.prisma.$disconnect();

    }
    
  }

  async remove(id: number): Promise<ApiTransactionResponse<IProducts | string>> {
    
    try {
      
      //Verificamos que exista el ID solicitado
      const existProductById = await this.findOne(id);

      if( existProductById.data == null ){
        return new ApiTransactionResponse(
          null,
          EResponseCodes.FAIL,
          `No pudo ser encontrado un producto con el ID ${id}`
        );
      }

      //Llegamos hasta acá, actualizamos entonces:
      const updateProduct = await this.prisma.tBL_PRODUCTS.update({
        where: { id },
        data: {
          status: false,
          userUpdateAt: "123456789", //TODO -> Falta el tema de la auth.
          updateDateAt: new Date(),
        }
      });

      return new ApiTransactionResponse(
        updateProduct,
        EResponseCodes.OK,
        "Producto eliminado correctamente"
      );

    } catch (error) {

      this.logger.log(`Ocurrió un error al intentar eliminar lógicamente el producto: ${error}`);
      return new ApiTransactionResponse(
        error,
        EResponseCodes.FAIL,
        "Ocurrió un error al intentar eliminar lógicamente el producto"
      );
      
    } finally {
      
      this.logger.log(`Eliminación lógica de producto finalizada`);
      await this.prisma.$disconnect();

    }
    
  }
}
