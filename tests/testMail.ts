// sendEmail.js

import { sendMail } from "../src/utils/mail";

async function main() {
    sendMail(
        "dongw0507@gmail.com",
        "선물이 도착했어요.",
        "pets-mas.com",
        )

}
main().then((response) => console.log(response))