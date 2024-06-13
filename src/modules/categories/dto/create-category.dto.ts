import { IsNotEmpty,
         IsOptional,
         IsString,
         MaxLength,
         MinLength } from "class-validator";

export class CreateCategoryDto {

    @IsString({ message: "El nombre la categoría debe ser un String válido" })
    @MinLength(1, { message: "El nombre la categoría además de requerida debe tener al menos 1 caracter" })
    @MaxLength(100, { message: "El nombre la categoría además de requerida no debe sobre pasar los 500 caracteres" })
    @IsNotEmpty({ message: "El nombre la categoría es un campo requerido" })
    public name: string;

    @IsString({ message: "El nombre la categoría debe ser un String válido" })
    @MaxLength(5000, { message: "El nombre la categoría además de requerida no debe sobre pasar los 500 caracteres" })
    @IsOptional()
    public description: string;

}
