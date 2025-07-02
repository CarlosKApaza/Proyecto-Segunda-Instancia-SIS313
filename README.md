# Proyecto Final: Infraestructura de TI Web Escalable y Tolerante a Fallos

## Resumen del Proyecto

Este proyecto documenta el diseño, la implementación y la gestión de una infraestructura de TI web funcional, escalable y tolerante a fallos. Se ha simulado un entorno de producción utilizando **cuatro máquinas virtuales** en Ubuntu Server 24.04 LTS.

La arquitectura se compone de un **balanceador de carga (Nginx)** que distribuye el tráfico entre **dos servidores de aplicación (Node.js)**. Estos servidores, a su vez, se comunican con un **servidor de base de datos (MySQL)** centralizado para la persistencia de los datos.

El objetivo principal ha sido demostrar de forma práctica conceptos de balanceo de carga, la estructura de una aplicación distribuida, y la tolerancia a fallos tanto a nivel de software (caída de un servidor de aplicación) como a nivel de almacenamiento mediante la configuración de un **RAID 5**.

## Diagrama de Arquitectura

El siguiente diagrama ilustra la topología de la red, la distribución de las 4 instancias y el flujo de comunicación entre los servicios, desde el cliente hasta la base de datos.

![image](https://github.com/user-attachments/assets/b9902a6e-7e21-4801-9eba-08cc1a1173d1)


## Tabla de Servidores y Configuración

| Rol del Servidor | Hostname (Ubuntu) | Software Instalado | Dirección IP Estática |
| :--- | :--- | :--- | :--- |
| **Servidor de Base de Datos** | `db01` | MySQL Server, `mdadm` | `192.168.0.104` |
| **Balanceador de Carga** | `lb01` | Nginx | `192.168.0.101` |
| **Servidor de Aplicación 1** | `app01` | Node.js, npm, express, mysql2 | `192.168.0.102` |
| **Servidor de Aplicación 2** | `app02` | Node.js, npm, express, mysql2 | `192.168.0.103` |


## Justificación de Tecnologías

* **Plataforma de Virtualización (Oracle VirtualBox):** Se utilizó para simular la infraestructura de 4 servidores en un solo host físico, permitiendo un entorno de pruebas controlado y eficiente.
* **Sistema Operativo (Ubuntu Server 24.04 LTS):** Se seleccionó esta versión por ser un requisito explícito del proyecto y por su estabilidad y amplio soporte.
* **Balanceador de Carga (Nginx):** Se eligió Nginx por su alto rendimiento y bajo consumo de recursos. Fue configurado con el algoritmo por defecto **Round Robin** para distribuir equitativamente las peticiones.
* **Aplicación Web (Node.js + Express):** Se utilizó Node.js junto con el framework Express para desarrollar una API RESTful con funcionalidad **CRUD**.
* **Base de Datos (MySQL):** Se implementó MySQL como sistema gestor de base de datos relacional para garantizar la persistencia de los datos.
* **Esquema de Red (IPs Estáticas):** Se configuró una dirección IP estática en cada servidor para asegurar una comunicación estable y predecible entre los componentes.
* **Almacenamiento (RAID 5):** Se implementó un arreglo RAID 5 en el servidor de base de datos para proveer tolerancia a fallos a nivel de disco.

## Pasos de Implementación

A continuación, se describen los pasos clave de la configuración de cada componente de la infraestructura.

### 1. Servidor de Base de Datos (`db01`)

* **Configuración de Discos:** Se crearon 3 discos virtuales adicionales de 10 GB cada uno en VirtualBox.
  
  ![image](https://github.com/user-attachments/assets/36772542-3236-4724-a083-aa1cb01d4590)

* **Configuración de RAID 5:** Se utilizó `mdadm` para crear un arreglo RAID 5 (`/dev/md0`) con los 3 discos. Posteriormente, se formateó el arreglo con un sistema de archivos `ext4`.

![image](https://github.com/user-attachments/assets/ec47a83a-820b-4c9e-8558-93ba147b2879)

  
* **Montaje Permanente:** Se configuró el archivo `/etc/fstab` con el UUID del dispositivo `/dev/md0` para asegurar que el arreglo se monte automáticamente en el directorio `/mnt/data` tras cada reinicio.

  ![image](https://github.com/user-attachments/assets/e446f428-846f-4358-9018-9fec85c434fc)


* **Instalación y Configuración de MySQL:** Se instaló `mysql-server`. Se modificó el archivo `mysqld.cnf` para permitir conexiones remotas (`bind-address = 0.0.0.0`). Finalmente, se creó la base de datos `sis313_db`, el usuario `app_user` para la aplicación y la tabla `productos`.


![image](https://github.com/user-attachments/assets/a4647b85-6a91-4083-8db4-f3097d7412cf)

![image](https://github.com/user-attachments/assets/c0a2ecb8-4c30-441a-b9f5-3595306ff9dc)

![image](https://github.com/user-attachments/assets/6865acff-dd86-4a85-8d99-feb340435623)

![image](https://github.com/user-attachments/assets/bb3acc7a-1442-4492-9572-7127192c52b4)



### 2. Servidores de Aplicación (`app01` y `app02`)

* **Instalación de Software:** En ambos servidores se instaló Node.js y el gestor de paquetes NPM.
* **Instalación de Dependencias:** Se utilizó NPM para instalar las librerías `express` y `mysql2`, necesarias para la aplicación.
* **Despliegue del CRUD:** Se creó el archivo `app.js` en ambos servidores con el código de la API CRUD, configurando las credenciales para la conexión a la base de datos `db01`.

![image](https://github.com/user-attachments/assets/d29ff97d-0f57-47bd-a30a-c5fd3bfd9478)
![image](https://github.com/user-attachments/assets/df66bab5-a915-4fcd-bc01-bd77729f54cc)

  
* **Configuración de Red:** Se asignó la IP estática correspondiente a cada servidor (`.102` y `.103`) a través de Netplan.

![image](https://github.com/user-attachments/assets/ce37c0ec-3aa7-49b9-9aef-d1d48bc3f5c2)

![image](https://github.com/user-attachments/assets/f9eed95e-0d00-4f58-9a9d-5075c65ed574)
  

### 3. Balanceador de Carga (`lb01`)

* **Instalación de Software:** Se instaló Nginx en el servidor.
* **Configuración de Red:** Se asignó la IP estática `192.168.0.101`.
* **Configuración del Balanceo:** Se modificó el archivo `/etc/nginx/sites-available/default` para definir un bloque `upstream` con las IPs y puertos de los dos servidores de aplicación. En el bloque `server`, se utilizó la directiva `proxy_pass` para redirigir todo el tráfico entrante al grupo `upstream`.

![image](https://github.com/user-attachments/assets/81f24213-8baa-4dc4-aedf-4839ec116dd1)


## Demostración y Pruebas

* **Prueba de Balanceo y CRUD:** Se realizaron pruebas con `curl` a la IP del balanceador (`http://192.168.0.101`). Las peticiones a la ruta raíz `/` alternaron correctamente entre los servidores `app01` y `app02`. Se realizaron peticiones `POST` a `/productos` para crear datos y peticiones `GET` para leerlos, validando el funcionamiento del CRUD.

![image](https://github.com/user-attachments/assets/967409ad-f14d-48d7-85a9-4b6ea938ae42)

![image](https://github.com/user-attachments/assets/80bd97ae-62fd-40dd-a5a5-55647ea59d87)


* **Prueba de Tolerancia a Fallos:** Se simuló la caída del servidor `app01` deteniendo su aplicación Node.js. Inmediatamente, todas las peticiones al balanceador fueron redirigidas a `app02`, demostrando que el servicio se mantuvo disponible.

![image](https://github.com/user-attachments/assets/dfc984f6-6890-4b31-8fad-a5c7f3016d50)

![image](https://github.com/user-attachments/assets/f295643f-2f5e-4d93-a559-499ae52fd8f4)

![image](https://github.com/user-attachments/assets/0e2ec6fc-24d7-49eb-8386-2f5e7b95cf58)


## Hardening Aplicado

* **Firewall (UFW):** Se utilizó Uncomplicated Firewall (UFW) para restringir el acceso a los puertos estrictamente necesarios en cada servidor:
    * **`lb01`:** Se permitió tráfico entrante en el puerto `80 (HTTP)`.
    * **`app01` y `app02`:** Se permitió tráfico entrante en el puerto `3000`.
    * **`db01`:** Se permitió tráfico entrante en el puerto `3306 (MySQL)`.
* **Seguridad de Base de Datos:** Se ejecutó el script `mysql_secure_installation` para eliminar usuarios anónimos, deshabilitar el acceso remoto de `root` y establecer una contraseña segura.

## Archivos del Repositorio

El repositorio está estructurado de la siguiente manera:

* **/app_nodejs/:** Contiene el código fuente de la aplicación CRUD (`app.js`).
* **/config_balanceador_nginx/:** Contiene el archivo de configuración de Nginx (`default`).
* **/config_mysql/:** Contiene el archivo de configuración de MySQL (`mysqld.cnf`).
* **/config_netplan/:** Contiene los 4 archivos de configuración de red para cada servidor.
* **README.md:** Este archivo.
