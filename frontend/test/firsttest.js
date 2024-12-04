/* eslint-disable @typescript-eslint/no-require-imports */

import { assert } from "chai";
import { Builder } from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome.js";

describe("test if title is returned ", function () {
    let driver;

    before(async () => {
        driver = await new Builder()
            .forBrowser("chrome")
            .setChromeOptions(new Options().addArguments("--headless"))
            .build();
    });

    after(async () => {
        await driver.quit();
    });

    it("should load the Vite homepage and check website name ", async () => {
        await driver.get(
            "http://frontend-854925512.ap-south-1.elb.amazonaws.com"
        );
        let title = await driver.getTitle();

        console.log(title);
        assert.equal(title, "DNS Hosting", "Website name not correct");
    });
});