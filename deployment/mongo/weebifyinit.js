// root
const rootUsername = process.env.MONGO_INITDB_ROOT_USERNAME;
const rootPassword = process.env.MONGO_INITDB_ROOT_PASSWORD;

// user for backend
const dbWeebifyUser = process.env.DB_WEEBIFY_USERNAME;
const dbWeebifyPass = process.env.DB_WEEBIFY_PASSWORD;

// weebify user
const adminUsername = process.env.WEEBIFY_USER;
const adminPasswordHash = process.env.WEEBIFY_PASSWORD_HASH;

console.log({
    rootUsername,
    rootPassword,
    dbWeebifyUser,
    dbWeebifyPass,
    adminUsername,
    adminPasswordHash,
});

// User to create
const userDocument = {
    _id: ObjectId(),
    bio: "",
    role: "GOD",
    inviteCodes: [],
    username: adminUsername,
    displayName: adminUsername,
    pfp: "default",
    passwordHash: adminPasswordHash,
    following: [],
    sessions: [],
};

const adminDb = db.getSiblingDB("admin");
adminDb.auth(rootUsername, rootPassword);

db.createUser({
    user: dbWeebifyUser,
    pwd: dbWeebifyPass,
    roles: [{ role: "readWrite", db: "weebify" }],
});

db = db.getSiblingDB("weebify");

db.users.insertOne(userDocument);

db = db.getSiblingDB("admin");

db.createUser({
    user: dbWeebifyUser,
    pwd: dbWeebifyPass,
    roles: [{ role: "readWrite", db: "weebify" }],
});
