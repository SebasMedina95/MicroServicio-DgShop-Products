import { IsArray,
         IsNotEmpty,
         IsNumber,
         IsOptional,
         IsPositive,
         IsString,
         MaxLength,
         Min,
         MinLength } from "class-validator";
import { ValidSizes, ValidTypes } from "../../../types/product.type";

export class CreateProductDto {
    
    @IsString({ message: "La descripción debe ser un String válido" })
    @MinLength(1, { message: "La descripción además de requerida debe tener al menos 1 caracter" })
    @MaxLength(5000, { message: "La descripción además de requerida no debe sobre pasar los 5000 caracteres" })
    @IsNotEmpty({ message: "La descripción es un campo requerido" })
    public description: string;

    // @IsArray({ message: "Las imágenes deben ser un array de String/Urls válidas" })
    @IsString({ message: "Las imágenes debe ser un String válido []" })
    @IsOptional()
    public images: string[];

    @IsNumber({}, {message: "La cantidad en Stock no debe ser negativa"})
    @Min(0)
    @IsNotEmpty({ message: "La cantidad en Stock es un campo requerido" })
    public inStock: number;

    @IsNumber({ maxDecimalPlaces: 2 }, { message: "El precio debe ser numérico y máximo con 2 decimales" })
    @IsPositive()
    @Min(0)
    @IsNotEmpty({ message: "El precio es un campo requerido" })
    public price: number;

    // @IsArray({ message: "Las tallas deben ser un array de String válida" })
    @IsString({ message: "Las tallas debe ser un String válido []" })
    @IsNotEmpty({ message: "Las tallas son un campo requerido" })
    public sizes: ValidSizes[] | string;

    // @IsArray({ message: "Los tags deben ser un array de String válida" })
    @IsString({ message: "Los tags debe ser un String válido []" })
    @IsNotEmpty({ message: "Los tags del producto es un campo requerido" })
    public tags: string[];

    @IsString({ message: "El nombre del producto debe ser un String válido" })
    @MinLength(1, { message: "El nombre del producto además de requerida debe tener al menos 1 caracter" })
    @MaxLength(500, { message: "El nombre del producto además de requerida no debe sobre pasar los 500 caracteres" })
    @IsNotEmpty({ message: "El nombre del producto es un campo requerido" })
    public title: string;

    @IsString({ message: "El tipo deben ser un array de String válida" })
    @MinLength(1, { message: "El tipo además de requerida debe tener al menos 1 caracter" })
    @MaxLength(50, { message: "El tipo además de requerida no debe sobre pasar los 50 caracteres" })
    @IsNotEmpty({ message: "El tipo es un campo requerido" })
    public type: ValidTypes;

    @IsNumber({}, { message: "El id de la categoría debe ser numérico" })
    @IsNotEmpty({ message: "El id de la categoría es un campo requerido" })
    public categoryId: number;

}
