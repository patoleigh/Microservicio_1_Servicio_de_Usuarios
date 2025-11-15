Se integro el servicio de usuarios al cluster, en especifico se crearon dos microservicios:
- users-service-74f47f7d87-z46bd, que tiene toda la logica de la API de usuarios, esta implementado con autoscaling dependiendo de la carga de cpu y memoria, como minimo tiene una instancia y maximo 2.
- postgres-0, base de datos de los usuarios, solo existe una, si el microservicio de usuarios escala los dos se van a conectar a la misma BD.

Además, integramos la publicación de los eventos sobre la creación o el update de usuarios a una de las colas de rabbitMQ que fue desplegado por uno de nuestros compañeros (message-broker)

El acceso por URL directamente no pudimos implementarlo, por lo que entendimos existen problemas con el DNS que apunta a otra direccion IP distinta al Nginx-ingress configurado, por lo cual, dejamos configurado el acceso mediante la IP sin pasar por el DNS, con la siguientes direcciones:

- http://134.199.176.197/usersservice/docs#/
- http://134.199.176.197/usersservice/health
- http://134.199.176.197/usersservice/*{endpoint}


Integrantes (Grupo 1 - Usuarios):
    - Patricio Leigh
    - Tomás Castillo
    - Carlos Vera

