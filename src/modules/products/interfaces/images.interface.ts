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