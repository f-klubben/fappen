import Dexie from "dexie";

export class AppDatabase extends Dexie {
    static active_profile_key = "profile.active";

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
            })
    }
}
