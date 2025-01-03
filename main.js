const { Client } = require('@notionhq/client');
const moment = require('moment');
require("dotenv").config();
const translations = require('./locales/translations.json');
const { I18n } = require('i18n-js');

const i18n = new I18n(translations);
i18n.locale = `${process.env.LOCALE}`
const prompt = require("prompt-sync")({ sigint: true });
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const parent_page_id = process.env.PARENT_PAGE_ID

const firstname = prompt(i18n.t('prompt.firstname'));
const lastname = prompt(i18n.t('prompt.lastname'));
const year = prompt(i18n.t('prompt.year'));
const week_from = prompt(i18n.t('prompt.week_from'));
const company = prompt(i18n.t('prompt.company'));
const week_to = 52; // Alblak?

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

createEmptyPage(notion, parent_page_id, year)
    .then(async (response) => {
        const toggle_id = response.id
        for (let i = week_from; i <= week_to; i++) {
            await createWeekPage(notion, toggle_id, i, year, firstname, lastname)
            if (i % 3 === 0) {
                await delay(1000);  // 1 second delay
            }
        }
    })
    .catch((e) => {
        console.log(e)
    })




async function createEmptyPage(notion, parentBlockId, year) {

    return notion.pages.create({
        parent: {
            type: "page_id",
            page_id: parentBlockId
        },  // Set the parent database ID
        properties: {
            'title': { title: [{ text: { content: `${year}-${parseInt(year, 10) + 1}` } }] },
        },
    });
}

async function createWeekPage(notion, parentBlockId, weekNumber, year, firstname, lastname) {
    // Calculate the first day of the week (Monday)
    const firstDayOfWeek = moment().year(year).week(weekNumber).startOf('isoWeek');

    // Create a new page in Notion for the calendar week
    const page = await notion.pages.create({
        parent: {
            type: "page_id",
            page_id: parentBlockId
        },  // Set the parent database ID
        properties: {
            title: { title: [{ text: { content: `${i18n.t('page.documentation')}-${firstname}-${lastname}-20${year}-${weekNumber}` } }] },
        },
    });

    const pageId = page.id;

    // Add a table for the week
    await notion.blocks.children.append({
        block_id: pageId,
        children: [
            {
                type: "divider",
                divider: {}
            },
            {
                type: 'column_list',
                column_list: {
                    children: [
                        {
                            type: 'column',
                            column: {
                                children: [
                                    {
                                        object: "block",
                                        type: "paragraph",
                                        paragraph: {
                                            rich_text: [
                                                {
                                                    type: "text",
                                                    text: {
                                                        content: i18n.t('page.documentation')
                                                    },
                                                    annotations: {
                                                        bold: true,
                                                    },
                                                }
                                            ]
                                        }
                                    }
                                ],
                            }
                        },
                        {
                            type: 'column',
                            column: {
                                children: [
                                    {
                                        object: "block",
                                        type: "paragraph",
                                        paragraph: {
                                            rich_text: [
                                                {
                                                    type: "text",
                                                    text: {
                                                        content: `${i18n.t('page.cw')} ${weekNumber} / 20${year}`
                                                    },
                                                    annotations: {
                                                        bold: true,
                                                    },
                                                }
                                            ]
                                        }
                                    }
                                ],
                            }

                        },
                        {
                            type: 'column',
                            column: {
                                children: [
                                    {
                                        object: "block",
                                        type: "paragraph",
                                        paragraph: {
                                            rich_text: [
                                                {
                                                    type: "text",
                                                    text: {
                                                        content: `${firstname} ${lastname}`
                                                    },
                                                    annotations: {
                                                        bold: true,
                                                    },
                                                }
                                            ]
                                        }
                                    }
                                ],
                            }

                        },
                    ]
                },
            },
            {
                type: "divider",
                divider: {}
            },
            {
                object: 'block',
                type: 'equation',
                equation: {
                    expression: `\\large ${i18n.t('page.activities')}`,
                },
            },
            {
                object: 'block',
                type: 'table',
                table: {
                    table_width: 3,
                    has_column_header: true,
                    children: [
                        {
                            object: 'block',
                            type: 'table_row',
                            table_row: {
                                cells: [
                                    [{ type: 'text', text: { content: i18n.t('page.activities_description') } }],
                                    [{ type: 'text', text: { content: i18n.t('page.activities') } }],
                                    [{ type: 'text', text: { content: i18n.t('page.activities_time') } }],
                                ],
                            },
                        },
                        ...Array.from({ length: 5 }, (_, i) => {
                            const dayOfWeek = firstDayOfWeek.clone().add(i, 'days');
                            return {
                                object: 'block',
                                type: 'table_row',
                                table_row: {
                                    cells: [
                                        [{ type: 'text', text: { content: `${dayOfWeek.format('dddd')}, ${company}, ${dayOfWeek.format('DD.MM.YY')}` } }],
                                        [{ type: 'text', text: { content: '-' } }],
                                        [{ type: 'text', text: { content: '8.4' } }],
                                    ],
                                },
                            };
                        }),
                    ],
                },
            },
            // Block for the 3 equations
            {
                object: 'block',
                type: 'equation',
                equation: {
                    expression: `\\large ${i18n.t('page.weekly_review')}`,
                },
            },
            {
                object: "block",
                type: "paragraph",
                paragraph: {
                    rich_text: [
                        {
                            type: "text",
                            text: {
                                content: "tbd"
                            }
                        }
                    ]
                }
            },
            {
                object: 'block',
                type: 'equation',
                equation: {
                    expression: `\\large ${i18n.t('page.reflection')}`,
                },
            },
            {
                object: "block",
                type: "paragraph",
                paragraph: {
                    rich_text: [
                        {
                            type: "text",
                            text: {
                                content: "tbd"
                            }
                        }
                    ]
                }
            },
            {
                object: 'block',
                type: 'equation',
                equation: {
                    expression: `\\large ${i18n.t('page.week_mood')}`,
                },
            },
            {
                object: "block",
                type: "paragraph",
                paragraph: {
                    rich_text: [
                        {
                            type: "text",
                            text: {
                                content: "tbd"
                            }
                        }
                    ]
                }
            }
        ],
    });

    console.log(`Week ${weekNumber} / 52 created`);
}