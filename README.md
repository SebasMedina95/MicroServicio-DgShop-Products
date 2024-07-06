<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

## DESCRIPCIÓN GENERAL DEL PROYECTO ##
Este proyecto será el de una tienda de comercio digital, en la cual se venderá productos de ropa, tanto para hombre como para mujeres y niños, se generará una estructura de trabajo donde manejaremos los productos, a que categoría pertenencen y también que proveedor suministra el artículo a la tienda, gestionando de este modo las compras también al almacen. En este orden de ideas, se implementará también la generación de ordenes para la venta de diferentes artículos, la estructura de las ventas y un sistema de manejo de usuarios, tanto para que los clientes se registren y compren como también para los adeministradores del sistema.

## DESCRIPCIÓN DEL MÓDULO ##
Este es el módulo para el manejo de productos, categorías y proveedores.
``Nota: ``Posiblemente aquí coloquemos el sistema de compras para surtir el local (Aún se discute)

``Desarrollado por``: [Juan Sebastian Medina Toro](https://www.linkedin.com/in/juan-sebastian-medina-toro-887491249/).


## PASOS DE INSTALACIÓN ##
Una vez descagada la aplicación, siga los siguientes pasos:
1. Ejecute el comando de instalación de dependencias:
```bash
$ npm install
```
2. Renombre el archivo ``.env.template`` a ``.env`` y configure las variables de entorno
3. Ejecute el comando para levantar la imagen de Docker:
```bash
$ docker compose up -d
```
- Configuración de la imagen de Docker. *Debemos realizar una configuración especial para la asignación de permisos al usuario que vamos a usar para las migraciones tratandose de una BD MySQL*, en las variables de entorno, tenemos definida a ``DB_MYSQL_USER``, este usuario debemos aplicarle los permisos para la generación de migraciones con PrismaORM, debe seguir los siguientes pasos ``después de haber levantado la imagen``:

- Luego de ubicar el ID de la imagen usando el comando de docker ``docker container ls`` para listar los contenedores, ejecutamos el comando:
   ```bash
   $ docker exec -it <mysql-container-id> mysql -u root -p
   'Y remplace el <mysql-container-id> por el ID del contenedor que se creo'.
   'Puede verificar el id del contenedor con el comando: docker container ls'
   ```

- Luego ejecutamos con base a las credenciales, nos pide la contraseña, la ``contraseña es el valor que le dimos a nuestra variable de entorno MYSQL_ROOT_PASSWORD`` cuando creamos las configuraciones del archivo *docker-compose.yml*.

- Configuración: Ejecutamos el comando:
   ```bash
   $ GRANT ALL PRIVILEGES ON *.* TO 'your_database_user'@'%' WITH GRANT OPTION;
   'Y remplazamos el 'your_database_user' por el usuario que le queremos asignar los permisos, la variable de entorno DB_MYSQL_USER'. 
   OJO => Debemos incluir el punto y coma (;) en la ejecución del comando.
   ```

- Aplicamos los privilegios con el comando
   ```bash
   $ FLUSH PRIVILEGES;
   'OJO => Debemos incluir el punto y coma (;) en la ejecución del comando.'
   Al todo quedar OK, podemos salir con el comando exit
   ```
6. Ejecutamos las migraciones usando el comando de Prisma:
   ```bash
   $ npx prisma generate
   ```
7. Ejecutar para levantar el proyecto en modo desarrollo:
   ```bash
   $ npm run start:dev
   ```

- Si todo sale bien, podemos colocar el comando ``exit`` para salir de la terminal de MySQL.



## CREACIÓN Y EJECUCIÓN DE MIGRACIONES USANDO PRISMA ##
- Creación y ejecución de migraciones para la base de datos:
  - Para crear una migración debemos usar:
    **NOTA 1:** Se recomienda ejecutar como Administrador.
    **NOTA 2:** Cambie el DEFINA-NOMBRE-MIGRACION por el nombre que desea dar a la migración.
    ```
    npx prisma migrate dev --name DEFINA-NOMBRE-MIGRACION
    ```
  - Para ejecutar una migración usamos:
    **NOTA:** Se recomienda ejecutar como Administrador.
    ```
    npx prisma generate
    ```

## Pendiente ##
EMPEZAR A TRABAJAR CON LOS SERVICIOS DE LAS CATEGORIAS, PRIMERO DEBEMOS PODER GESTIONAR 
LAS CATEGORÍAS PARA LUEGO GESTIONAR LOS PRODUCTOS