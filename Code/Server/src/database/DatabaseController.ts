import mongoose from 'mongoose';
import { List } from '../List';

export class DatabaseController {
    constructor(public isProduction: boolean) { }

    public init = async (dbName?: string): Promise<void> => {
        await this.connect(dbName);
        mongoose.connection.on('disconnected', this.connect);
    };

    connect = async (dbName?: string): Promise<void> => {
        let DATABASE_CONNECTION_STRING = this.isProduction ? `mongodb+srv://anyone:anyone@cluster0.bloqp.mongodb.net/production` : `mongodb://localhost:27017/test`;
        if (dbName)
            DATABASE_CONNECTION_STRING = `mongodb://localhost:27017/${dbName}`
        try {
            await mongoose.connect(
                DATABASE_CONNECTION_STRING, {
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                    useFindAndModify: false,
                    useCreateIndex: true,
                } as mongoose.ConnectionOptions
            );
        } catch (e) {
            (console).log('Error connecting to DataBase:\n', e, '\nkilling process...');
            return process.exit(1);
        }
    };

    disconnect = async (): Promise<void> => {
        mongoose.connection.off('disconnected', this.connect);
        await mongoose.disconnect();
    };

    documentToObject(document: any): any {
        if (!document)
            throw new Error('missing document');
        return document.toObject();
    }

    documentArrayToList(docArray:any[]): List<any> {
        const docList = new List<any>([]);
        docArray.forEach((doc) => {
            docList.push(this.documentToObject(doc));
        });
        return docList
    }
}
