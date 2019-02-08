import faker = require("faker");
import Article from "../entities/Article";

const articles: Article[] = Array(20).fill(undefined).map((x, id) => {
    const authorUsername = faker.random.alphaNumeric(6);
    const roleId = faker.random.number(30)

    return {
        id: id + 1,
        title: faker.commerce.productName(),
        slug: faker.lorem.slug(),
        content: "<p>" + faker.lorem.paragraphs(4, "</p><p>") + "</p>",
        updated: faker.date.past(),
        roleId,
        role: {
            id: roleId,
            title: faker.name.jobTitle(),
            slug: faker.lorem.slug(),
            level: faker.random.number(5),
        },
        authorUsername,
        author: {
            email: faker.internet.email(),
            username: authorUsername,
            name: faker.name.findName(),
            last_login: faker.date.past(),
        },
    }
});

export { articles };
