module.exports = {
    routes: [
        {
            method: "POST",
            path: "/category/category-replace",
            handler: "category-replace.replacePlaceholders",
            config: { auth: false },
        },
    ],
};
