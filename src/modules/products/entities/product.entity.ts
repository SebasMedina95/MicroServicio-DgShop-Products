import { ValidSizes, ValidTypes } from "../../../types/product.type";
import { Category } from "../../../modules/categories/entities/category.entity";
import { Provider } from "../../../modules/providers/entities/provider.entity";

export class Product {

    public id?: number;
    public description: string;
    public inStock: number;
    public price: number;
    public sizes: ValidSizes[];
    public slug?: string;
    public tags: string[];
    public colors: string[];
    public title: string;
    public type: ValidTypes;

    public categoryId: Category | number;
    public providerId: Provider | number;

    public userCreateAt?: string;
    public createDateAt?: Date;
    public userUpdateAt?: string;
    public updateDateAt?: Date;

}
