import { DataSource } from "typeorm";

    export const appDataSource = new DataSource({type: "postgres"});
     
     const main = async () => {
         console.time('main');
         await appDataSource.initialize();
     };
     
     main().catch(err => {
         console.error(err);
         process.exit(1);
     });
