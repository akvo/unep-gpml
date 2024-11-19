module.exports = {
    routes: [
        {
            method: "GET",
            path: "/category/category-replace/:country/:categoryId/:regionMswValue",
            handler: "category-replace.replacePlaceholders",
            config: { auth: false },
        },
    ],
};