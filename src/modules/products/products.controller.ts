import { Controller,
         Get,
         Post,
         Body,
         Patch,
         Param,
         Delete,
         UseInterceptors,
         UploadedFiles } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';

import { ProductsService } from './products.service';
import { FilesService } from '../../helpers/files/files.service';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PageOptionsDto } from '../../helpers/paginations/dto/page-options.dto';
import { PageDto } from '../../helpers/paginations/dto/page.dto';

import { MaxFileSizeValidator } from './validators/max-file-size-validator';
import { FileTypeValidator } from './validators/file-type-validator';

import { ApiTransactionResponse } from '../../util/ApiResponse';
import { EResponseCodes } from '../../constants/ResponseCodesEnum';
import { CustomError } from '../../helpers/errors/custom.error';
import { IErrorImages, IImagesSimpleTable, IProducts } from './interfaces/products.interface';

@Controller('products')
export class ProductsController {

  constructor(
    private readonly productsService: ProductsService,
    private readonly cloudinaryService: FilesService
  ) {}

  @Post('/create')
  @UseInterceptors(FilesInterceptor('imagesProducts', 10))
  async create(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() createProductDto: CreateProductDto,
  ): Promise<ApiTransactionResponse<IProducts | string | IErrorImages[] | CustomError>> {

    let errorsImages: IErrorImages[] = [];
    let imagesNames: string[] = [];

    if (files) {

      const maxFileSizeValidator = new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 4 }); // 4 MB
      const fileTypeValidator = new FileTypeValidator({ fileType: '.(png|jpg|jpeg)' });

      for (const iterImgs of files) {
            
        if (!maxFileSizeValidator.isValid(iterImgs)) {
          errorsImages.push({
            error: "El tamaño de la imagen sobrepasa las 4MB",
            fileError: iterImgs.originalname
          });
        }

        if (!fileTypeValidator.isValid(iterImgs)) {
          errorsImages.push({
            error: "El formato de la imagen es diferente a .(png|jpg|jpeg)",
            fileError: iterImgs.originalname
          });
        }

        imagesNames.push(iterImgs.originalname);
        
      }

    }

    if( errorsImages.length > 0 ){
      return new ApiTransactionResponse(
        errorsImages,
        EResponseCodes.FAIL,
        "Las imágenes de los productos tienen errores, revise."
      );
    }

    // Aquí puedes manejar el DTO y el archivo si existe.
    //? Registremos primero el producto
    const saveProduct = await this.productsService.create(createProductDto);
    if( saveProduct instanceof CustomError  ){
      return new ApiTransactionResponse(
        saveProduct.message,
        EResponseCodes.FAIL,
        "Ocurrieron errores, no se pudo registrar el producto."
      );
    }

    //? Registramos las imágenes
    if( files && errorsImages.length == 0 ){

      const product = saveProduct as IProducts;
      for (const iterImages of files) {
        
        let executeFile = this.cloudinaryService.uploadFile(iterImages);

        executeFile.then( async(p)  => {

          const url_cloudinary = p.url;
          const objReg: IImagesSimpleTable = {
            url: url_cloudinary,
            productId: product.id
          }
  
          await this.productsService.createImages(objReg);
  
        })

      }

    }

    return new ApiTransactionResponse(
      saveProduct,
      EResponseCodes.OK,
      "Producto registrado correctamente."
    );

  }

  @Get('/get-paginated')
  async findAll(
    @Body() pageOptionsDto: PageOptionsDto
  ): Promise<PageDto<IProducts> | Object> {

    return this.productsService.findAll(pageOptionsDto);

  }

  @Get('/get-by-id/:id')
  async findOne(
    @Param('id') id: number
  ): Promise<ApiTransactionResponse<IProducts | string>> {

    return this.productsService.findOne(id);

  }

  @Patch('/update/:id')
  @UseInterceptors(FilesInterceptor('imagesProducts', 10))
  async update(
    @Param('id') id: number,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() updateProductDto: UpdateProductDto
  ): Promise<ApiTransactionResponse<IProducts | string | IErrorImages[] | CustomError>> {

    let errorsImages: IErrorImages[] = [];
    let imagesNames: string[] = [];

    //1. Si viene imagenes
    if( files ){
      
      //1.1 Validamos imágenes
      const maxFileSizeValidator = new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 4 }); // 4 MB
      const fileTypeValidator = new FileTypeValidator({ fileType: '.(png|jpg|jpeg)' });

      for (const iterImgs of files) {
            
        if (!maxFileSizeValidator.isValid(iterImgs)) {
          errorsImages.push({
            error: "El tamaño de la imagen sobrepasa las 4MB",
            fileError: iterImgs.originalname
          });
        }

        if (!fileTypeValidator.isValid(iterImgs)) {
          errorsImages.push({
            error: "El formato de la imagen es diferente a .(png|jpg|jpeg)",
            fileError: iterImgs.originalname
          });
        }

        imagesNames.push(iterImgs.originalname);
        
      }

      if( errorsImages.length > 0 ){
        return new ApiTransactionResponse(
          errorsImages,
          EResponseCodes.FAIL,
          "Las imágenes de los productos tienen errores, revise."
        );
      }

      //1.2 Borramos los que estén registrados anteriormente (Es decir que desde el Front nos deben garantizar esto)
      const getImages = await this.productsService.imagesByProduct(id);
      if( getImages.length > 0 ){

        //Las removemos de Cloudinary
        for (const iterImages of getImages) {

          const arrayName = iterImages.url.split('/');
          const getName = arrayName[arrayName.length - 1];
          const [ name , ext ] = getName.split('.');

          //Borramos con una función propia de cloudinary
          await this.cloudinaryService.deleteFile(name);

        }

        //Las removemos de la base de datos
        await this.productsService.deleteImagesByProduct(id);

      }

      //1.3 Registramos nuevamente o registramos la primera vez
      if( files && errorsImages.length == 0 ){

        for (const iterImages of files){

          let executeFile = this.cloudinaryService.uploadFile(iterImages);

          executeFile.then( async(p)  => {

            const url_cloudinary = p.url;
            const objReg: IImagesSimpleTable = {
              url: url_cloudinary,
              productId: id
            }
    
            await this.productsService.createImages(objReg);
    
          })

        }

      } 

    } //Si vamos a manejar archivos / imágenes

    //2. Actualizar producto
    const updateProduct = await this.productsService.update(id, updateProductDto);
    if( updateProduct instanceof CustomError  ){
      return new ApiTransactionResponse(
        updateProduct.message,
        EResponseCodes.FAIL,
        "Ocurrieron errores, no se pudo actualizar el producto."
      );
    }

    return new ApiTransactionResponse(
      updateProduct,
      EResponseCodes.OK,
      "Producto actualizado correctamente."
    );

  }

  @Delete('/remove-logic/:id')
  async remove(
    @Param('id') id: number
  ): Promise<ApiTransactionResponse<IProducts | string>> {

    return this.productsService.remove(id);

  }
}
