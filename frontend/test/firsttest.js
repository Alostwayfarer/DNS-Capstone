/* eslint-disable @typescript-eslint/no-require-imports */

const { assert } = require("chai");
const { Builder } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

describe("Frontend Tests", function () {
    let driver;

    before(async () => {
        driver = await new Builder()
            .forBrowser("chrome")
            .setChromeOptions(new chrome.Options().addArguments("--headless"))
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
