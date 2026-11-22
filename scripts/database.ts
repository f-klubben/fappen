import Dexie from "dexie";

export interface StoredToken {
    value: string;
    expires_at: number;
}

export class AppDatabase extends Dexie {
    static active_profile_key = "profile.active";
    static access_token_key = "profile.access_token";
    static balance_update_time_key = "job.balance_update"

    static instance: AppDatabase = new AppDatabase();

    /*
        The properties are populated dynamically, the actual table
        structure is determined by the schema given to the `.stores` call in
        the constructor. Make sure that the properties and the schema
        passed in the constructor are in sync.
     */

    /**
     * We use the settings table as a generic key/value storage.
     */
    settings!: Dexie.Table<any, string>;

    constructor() {
        super("AppDatabase");
        this.version(1)
            .stores({
                settings: '',
            });
    }
}
