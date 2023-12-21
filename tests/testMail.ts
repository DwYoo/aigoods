// sendEmail.js

import { sendMail } from "../src/utils/mail";

async function main() {
    sendMail(
        "chjcgw1@naver.com",
        "메리 댕냥스마스!",
        "https://www.pets-mas.com/clqcfvorf0004tr6pqajn8bhc",
        )

}
main().then((response) => console.log(response))