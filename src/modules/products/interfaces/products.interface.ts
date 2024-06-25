import { ValidSizes, ValidTypes } from "../../../types/product.type";
import { Category } from "../../categories/entities/category.entity";
import { Provider } from "../../providers/entities/provider.entity";

export interface IImages {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    destination: string;
    filename: string;
    path: string;
    size: number;
}

export interface IErrorImages {
    error: string;
    fileError: IImages | string;
}

export interface IImagesSimpleTable {
    id?: number;
    url: string;
}

export interface IProducts {
    id?: number;
    description: string;
    inStock: number;
    price: number;
    sizes: ValidSizes[] | string[];
    slug?: string;
    tags: string[];
    colors: string[];
    title: string;
    type: ValidTypes;

    categoryId?: Category | number;
    providerId?: Provider | number;
    images?: IImagesSimpleTable[];

    userCreateAt?: string;
    createDateAt?: Date;
    userUpdateAt?: string;
    updateDateAt?: Date;
}