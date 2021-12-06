import { UIStore } from "../../store";
const {
  geoCoverageTypeOptions,
  newGeoCoverageFormatStakeholder,
} = UIStore.currentState;

export const schema = {
  initiative: {
    type: "object",
    version: "2",
    label: "initiative",
    properties: {
      S2: {
        title: "",
        type: "object",
        depend: {
          id: "tabs",
          value: ["S2"],
        },
        required: ["S2_1"],
        properties: {
          S2_1: {
            title: "Are you directly managing this resource?",
            type: "string",
            enum: ["1-0", "1-1"],
            enumNames: [
              "You are granting editing and deleting rights ",
              "You are categorized as a submitter ",
            ],
          },
          "S2_G1_1.1": {
            title:
              "Please select other individuals that will support in managing the resource.",
            type: "string",
            enum: [],
            enumNames: [],
          },
        },
      },
      S4: {
        title: "",
        type: "object",
        depend: {
          id: "tabs",
          value: ["S4"],
        },
        properties: {
          S4_G1: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 0,
            },
            required: ["title", "summary", "url"],
            properties: {
              title: {
                title: "Title",
                type: "string",
              },
              summary: {
                title: "Description",
                type: "string",
              },
              url: {
                title: "URL",
                type: "string",
                format: "url",
              },
            },
          },
          S4_G2: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 1,
            },
            required: ["headquarter", "geoCoverageType"],
            properties: {
              headquarter: {
                title: "In which country are you headquarters?",
                enum: [],
              },
              geoCoverageType: {
                title: "What is the geographical coverage of your Entity?",
                type: "string",
                enum: geoCoverageTypeOptions.map((x) => x.toLowerCase()),
                enumNames: geoCoverageTypeOptions,
              },
              subnationalArea: {
                title:
                  "Please indicate if your Entity operates in a Subnational area only",
                type: "string",
              },
            },
          },
          S4_G3: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 2,
            },
            required: ["tags"],
            properties: {
              tags: {
                title: "Tags",
                enum: [],
              },
            },
          },
          S4_G4: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 3,
            },
            required: [""],
            properties: {
              image: {
                title: "Image",
                type: "string",
                format: "data-url",
              },
              banner: {
                title: "Banner",
                type: "string",
                format: "data-url",
              },
            },
          },
          S4_G5: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 4,
            },
            required: ["orgName", "newCompanyName", "newCompanyHeadquarter"],
            properties: {
              orgName: {
                title: "Search for a GPML Member Entity",
                enum: [],
              },
              companyName: {
                title: "Is your Entity not a GPML Member yet?",
                enum: [],
              },
              newCompanyName: {
                depend: {
                  id: "companyName",
                  value: [-1],
                },
                title: "Entity Name",
                type: "string",
              },
              newCompanyHeadquarter: {
                depend: {
                  id: "companyName",
                  value: [-1],
                },
                title: "In which country are your headquarters?",
                enum: [],
              },
            },
          },
        },
      },
      S5: {
        title: "",
        type: "object",
        depend: {
          id: "tabs",
          value: ["S5"],
        },
        properties: {
          S5_G1: {
            title: "",
            type: "object",
            required: [""],
            properties: {
              S5_G1_17: {
                title: "PUBLICATION YEAR",
                type: "string",
              },
            },
          },
        },
      },
    },
  },
  action: {
    type: "object",
    version: "2",
    label: "action",
    properties: {
      S2: {
        title: "",
        type: "object",
        depend: {
          id: "tabs",
          value: ["S2"],
        },
        required: ["S2_1"],
        properties: {
          S2_1: {
            title: "Are you directly managing this resource?",
            type: "string",
            enum: ["1-0", "1-1"],
            enumNames: [
              "You are granting editing and deleting rights ",
              "You are categorized as a submitter ",
            ],
          },
          "S2_G1_1.1": {
            title:
              "Please select other individuals that will support in managing the resource.",
            type: "string",
            enum: [],
            enumNames: [],
          },
        },
      },
      S4: {
        title: "",
        type: "object",
        depend: {
          id: "tabs",
          value: ["S4"],
        },
        properties: {
          S4_G1: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 0,
            },
            required: ["title", "summary", "url"],
            properties: {
              title: {
                title: "Title",
                type: "string",
              },
              summary: {
                title: "Description",
                type: "string",
              },
              url: {
                title: "URL",
                type: "string",
                format: "url",
              },
            },
          },
          S4_G2: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 1,
            },
            required: ["headquarter", "geoCoverageType"],
            properties: {
              headquarter: {
                title: "In which country are you headquarters?",
                enum: [],
              },
              geoCoverageType: {
                title: "What is the geographical coverage of your Entity?",
                type: "string",
                enum: geoCoverageTypeOptions.map((x) => x.toLowerCase()),
                enumNames: geoCoverageTypeOptions,
              },
              subnationalArea: {
                title:
                  "Please indicate if your Entity operates in a Subnational area only",
                type: "string",
              },
            },
          },
          S4_G3: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 2,
            },
            required: ["tags"],
            properties: {
              tags: {
                title: "Tags",
                enum: [],
              },
            },
          },
          S4_G4: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 3,
            },
            required: [""],
            properties: {
              image: {
                title: "Image",
                type: "string",
                format: "data-url",
              },
              banner: {
                title: "Banner",
                type: "string",
                format: "data-url",
              },
            },
          },
          S4_G5: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 4,
            },
            required: ["orgName", "newCompanyName", "newCompanyHeadquarter"],
            properties: {
              orgName: {
                title: "Search for a GPML Member Entity",
                enum: [],
              },
              companyName: {
                title: "Is your Entity not a GPML Member yet?",
                enum: [],
              },
              newCompanyName: {
                depend: {
                  id: "companyName",
                  value: [-1],
                },
                title: "Entity Name",
                type: "string",
              },
              newCompanyHeadquarter: {
                depend: {
                  id: "companyName",
                  value: [-1],
                },
                title: "In which country are your headquarters?",
                enum: [],
              },
            },
          },
        },
      },
      S5: {
        title: "",
        type: "object",
        depend: {
          id: "tabs",
          value: ["S5"],
        },
        properties: {
          S5_G1: {
            title: "",
            type: "object",
            required: [""],
            properties: {
              S5_G1_17: {
                title: "PUBLICATION YEAR",
                type: "string",
              },
            },
          },
        },
      },
    },
  },
  policy: {
    type: "object",
    version: "2",
    label: "policy",
    properties: {
      S2: {
        title: "",
        type: "object",
        depend: {
          id: "tabs",
          value: ["S2"],
        },
        required: ["S2_1"],
        properties: {
          S2_1: {
            title: "Are you directly managing this resource?",
            type: "string",
            enum: ["1-0", "1-1"],
            enumNames: [
              "You are granting editing and deleting rights ",
              "You are categorized as a submitter ",
            ],
          },
          "S2_G1_1.1": {
            title:
              "Please select other individuals that will support in managing the resource.",
            type: "string",
            enum: [],
            enumNames: [],
          },
        },
      },
      S4: {
        title: "",
        type: "object",
        depend: {
          id: "tabs",
          value: ["S4"],
        },
        properties: {
          S4_G1: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 0,
            },
            required: ["title", "summary", "url"],
            properties: {
              title: {
                title: "Title",
                type: "string",
              },
              summary: {
                title: "Description",
                type: "string",
              },
              url: {
                title: "URL",
                type: "string",
                format: "url",
              },
            },
          },
          S4_G2: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 1,
            },
            required: ["headquarter", "geoCoverageType"],
            properties: {
              headquarter: {
                title: "In which country are you headquarters?",
                enum: [],
              },
              geoCoverageType: {
                title: "What is the geographical coverage of your Entity?",
                type: "string",
                enum: geoCoverageTypeOptions.map((x) => x.toLowerCase()),
                enumNames: geoCoverageTypeOptions,
              },
              subnationalArea: {
                title:
                  "Please indicate if your Entity operates in a Subnational area only",
                type: "string",
              },
            },
          },
          S4_G3: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 2,
            },
            required: ["tags"],
            properties: {
              tags: {
                title: "Tags",
                enum: [],
              },
            },
          },
          S4_G4: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 3,
            },
            required: [""],
            properties: {
              image: {
                title: "Image",
                type: "string",
                format: "data-url",
              },
              banner: {
                title: "Banner",
                type: "string",
                format: "data-url",
              },
            },
          },
          S4_G5: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 4,
            },
            required: ["orgName", "newCompanyName", "newCompanyHeadquarter"],
            properties: {
              orgName: {
                title: "Search for a GPML Member Entity",
                enum: [],
              },
              companyName: {
                title: "Is your Entity not a GPML Member yet?",
                enum: [],
              },
              newCompanyName: {
                depend: {
                  id: "companyName",
                  value: [-1],
                },
                title: "Entity Name",
                type: "string",
              },
              newCompanyHeadquarter: {
                depend: {
                  id: "companyName",
                  value: [-1],
                },
                title: "In which country are your headquarters?",
                enum: [],
              },
            },
          },
        },
      },
      S5: {
        title: "",
        type: "object",
        depend: {
          id: "tabs",
          value: ["S5"],
        },
        properties: {
          S5_G1: {
            title: "",
            type: "object",
            required: [""],
            properties: {
              S5_G1_17: {
                title: "PUBLICATION YEAR",
                type: "string",
              },
            },
          },
        },
      },
    },
  },
  financing: {
    type: "object",
    version: "2",
    label: "financing",
    properties: {
      S2: {
        title: "",
        type: "object",
        depend: {
          id: "tabs",
          value: ["S2"],
        },
        required: ["S2_1"],
        properties: {
          S2_1: {
            title: "Are you directly managing this resource?",
            type: "string",
            enum: ["1-0", "1-1"],
            enumNames: [
              "You are granting editing and deleting rights ",
              "You are categorized as a submitter ",
            ],
          },
          "S2_G1_1.1": {
            title:
              "Please select other individuals that will support in managing the resource.",
            type: "string",
            enum: [],
            enumNames: [],
          },
        },
      },
      S4: {
        title: "",
        type: "object",
        depend: {
          id: "tabs",
          value: ["S4"],
        },
        properties: {
          S4_G1: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 0,
            },
            required: ["title", "summary", "url"],
            properties: {
              title: {
                title: "Title",
                type: "string",
              },
              summary: {
                title: "Description",
                type: "string",
              },
              url: {
                title: "URL",
                type: "string",
                format: "url",
              },
            },
          },
          S4_G2: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 1,
            },
            required: ["headquarter", "geoCoverageType"],
            properties: {
              headquarter: {
                title: "In which country are you headquarters?",
                enum: [],
              },
              geoCoverageType: {
                title: "What is the geographical coverage of your Entity?",
                type: "string",
                enum: geoCoverageTypeOptions.map((x) => x.toLowerCase()),
                enumNames: geoCoverageTypeOptions,
              },
              subnationalArea: {
                title:
                  "Please indicate if your Entity operates in a Subnational area only",
                type: "string",
              },
            },
          },
          S4_G3: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 2,
            },
            required: ["tags"],
            properties: {
              tags: {
                title: "Tags",
                enum: [],
              },
            },
          },
          S4_G4: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 3,
            },
            required: [""],
            properties: {
              image: {
                title: "Image",
                type: "string",
                format: "data-url",
              },
              banner: {
                title: "Banner",
                type: "string",
                format: "data-url",
              },
            },
          },
          S4_G5: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 4,
            },
            required: ["orgName", "newCompanyName", "newCompanyHeadquarter"],
            properties: {
              orgName: {
                title: "Search for a GPML Member Entity",
                enum: [],
              },
              companyName: {
                title: "Is your Entity not a GPML Member yet?",
                enum: [],
              },
              newCompanyName: {
                depend: {
                  id: "companyName",
                  value: [-1],
                },
                title: "Entity Name",
                type: "string",
              },
              newCompanyHeadquarter: {
                depend: {
                  id: "companyName",
                  value: [-1],
                },
                title: "In which country are your headquarters?",
                enum: [],
              },
            },
          },
        },
      },
      S5: {
        title: "",
        type: "object",
        depend: {
          id: "tabs",
          value: ["S5"],
        },
        properties: {
          publishYear: {
            title: "YEAR FOUNDED / YEAR OF COMMENCEMENT",
            type: "string",
          },
          S5_G2: {
            type: "object",
            title: "",
            required: ["valueAmount", "valueCurrency"],
            properties: {
              valueAmount: {
                title: "VALUE AMOUNT",
                type: "number",
              },
              valueCurrency: {
                title: "VALUE CURRENCY",
                enum: [],
              },
              valueRemark: {
                title: "VALUE REMARK",
                type: "string",
              },
            },
          },
          S5_G3: {
            type: "object",
            title: "",
            required: ["validFrom"],
            properties: {
              validFrom: {
                title: "VALID FROM",
                type: "string",
                format: "date",
              },
              validTo: {
                title: "VALID TO",
                type: "string",
                format: "date",
              },
            },
          },
        },
      },
    },
  },
  technical: {
    type: "object",
    version: "2",
    label: "technical",
    properties: {
      S2: {
        title: "",
        type: "object",
        depend: {
          id: "tabs",
          value: ["S2"],
        },
        required: ["S2_1"],
        properties: {
          S2_1: {
            title: "Are you directly managing this resource?",
            type: "string",
            enum: ["1-0", "1-1"],
            enumNames: [
              "You are granting editing and deleting rights ",
              "You are categorized as a submitter ",
            ],
          },
          "S2_G1_1.1": {
            title:
              "Please select other individuals that will support in managing the resource.",
            type: "string",
            enum: [],
            enumNames: [],
          },
        },
      },
      S4: {
        title: "",
        type: "object",
        depend: {
          id: "tabs",
          value: ["S4"],
        },
        properties: {
          S4_G1: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 0,
            },
            required: ["title", "summary", "url"],
            properties: {
              title: {
                title: "Title",
                type: "string",
              },
              summary: {
                title: "Description",
                type: "string",
              },
              url: {
                title: "URL",
                type: "string",
                format: "url",
              },
            },
          },
          S4_G2: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 1,
            },
            required: ["headquarter", "geoCoverageType"],
            properties: {
              headquarter: {
                title: "In which country are you headquarters?",
                enum: [],
              },
              geoCoverageType: {
                title: "What is the geographical coverage of your Entity?",
                type: "string",
                enum: geoCoverageTypeOptions.map((x) => x.toLowerCase()),
                enumNames: geoCoverageTypeOptions,
              },
              subnationalArea: {
                title:
                  "Please indicate if your Entity operates in a Subnational area only",
                type: "string",
              },
            },
          },
          S4_G3: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 2,
            },
            required: ["tags"],
            properties: {
              tags: {
                title: "Tags",
                enum: [],
              },
            },
          },
          S4_G4: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 3,
            },
            required: [""],
            properties: {
              image: {
                title: "Image",
                type: "string",
                format: "data-url",
              },
              banner: {
                title: "Banner",
                type: "string",
                format: "data-url",
              },
            },
          },
          S4_G5: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 4,
            },
            required: ["orgName", "newCompanyName", "newCompanyHeadquarter"],
            properties: {
              orgName: {
                title: "Search for a GPML Member Entity",
                enum: [],
              },
              companyName: {
                title: "Is your Entity not a GPML Member yet?",
                enum: [],
              },
              newCompanyName: {
                depend: {
                  id: "companyName",
                  value: [-1],
                },
                title: "Entity Name",
                type: "string",
              },
              newCompanyHeadquarter: {
                depend: {
                  id: "companyName",
                  value: [-1],
                },
                title: "In which country are your headquarters?",
                enum: [],
              },
            },
          },
        },
      },
      S5: {
        title: "",
        type: "object",
        depend: {
          id: "tabs",
          value: ["S5"],
        },
        properties: {
          S5_G1: {
            title: "",
            type: "object",
            required: [""],
            properties: {
              S5_G1_17: {
                title: "PUBLICATION YEAR",
                type: "string",
              },
            },
          },
        },
      },
    },
  },
  event_flexible: {
    type: "object",
    version: "2",
    label: "event_flexible",
    properties: {
      S2: {
        title: "",
        type: "object",
        depend: {
          id: "tabs",
          value: ["S2"],
        },
        required: ["S2_1"],
        properties: {
          S2_1: {
            title: "Are you directly managing this resource?",
            type: "string",
            enum: ["1-0", "1-1"],
            enumNames: [
              "You are granting editing and deleting rights ",
              "You are categorized as a submitter ",
            ],
          },
          "S2_G1_1.1": {
            title:
              "Please select other individuals that will support in managing the resource.",
            type: "string",
            enum: [],
            enumNames: [],
          },
        },
      },
      S4: {
        title: "",
        type: "object",
        depend: {
          id: "tabs",
          value: ["S4"],
        },
        properties: {
          S4_G1: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 0,
            },
            required: ["title", "summary", "url"],
            properties: {
              title: {
                title: "Title",
                type: "string",
              },
              summary: {
                title: "Description",
                type: "string",
              },
              url: {
                title: "URL",
                type: "string",
                format: "url",
              },
            },
          },
          S4_G2: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 1,
            },
            required: ["headquarter", "geoCoverageType"],
            properties: {
              headquarter: {
                title: "In which country are you headquarters?",
                enum: [],
              },
              geoCoverageType: {
                title: "What is the geographical coverage of your Entity?",
                type: "string",
                enum: geoCoverageTypeOptions.map((x) => x.toLowerCase()),
                enumNames: geoCoverageTypeOptions,
              },
              subnationalArea: {
                title:
                  "Please indicate if your Entity operates in a Subnational area only",
                type: "string",
              },
            },
          },
          S4_G3: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 2,
            },
            required: ["tags"],
            properties: {
              tags: {
                title: "Tags",
                enum: [],
              },
            },
          },
          S4_G4: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 3,
            },
            required: [""],
            properties: {
              image: {
                title: "Image",
                type: "string",
                format: "data-url",
              },
              banner: {
                title: "Banner",
                type: "string",
                format: "data-url",
              },
            },
          },
          S4_G5: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 4,
            },
            required: ["orgName", "newCompanyName", "newCompanyHeadquarter"],
            properties: {
              orgName: {
                title: "Search for a GPML Member Entity",
                enum: [],
              },
              companyName: {
                title: "Is your Entity not a GPML Member yet?",
                enum: [],
              },
              newCompanyName: {
                depend: {
                  id: "companyName",
                  value: [-1],
                },
                title: "Entity Name",
                type: "string",
              },
              newCompanyHeadquarter: {
                depend: {
                  id: "companyName",
                  value: [-1],
                },
                title: "In which country are your headquarters?",
                enum: [],
              },
            },
          },
        },
      },
      S5: {
        title: "",
        type: "object",
        depend: {
          id: "tabs",
          value: ["S5"],
        },
        properties: {
          S5_G1: {
            title: "",
            type: "object",
            required: [""],
            properties: {
              S5_G1_17: {
                title: "PUBLICATION YEAR",
                type: "string",
              },
            },
          },
        },
      },
    },
  },
  technology: {
    type: "object",
    version: "2",
    label: "technology",
    properties: {
      S2: {
        title: "",
        type: "object",
        depend: {
          id: "tabs",
          value: ["S2"],
        },
        required: ["S2_1"],
        properties: {
          S2_1: {
            title: "Are you directly managing this resource?",
            type: "string",
            enum: ["1-0", "1-1"],
            enumNames: [
              "You are granting editing and deleting rights ",
              "You are categorized as a submitter ",
            ],
          },
          "S2_G1_1.1": {
            title:
              "Please select other individuals that will support in managing the resource.",
            type: "string",
            enum: [],
            enumNames: [],
          },
        },
      },
      S4: {
        title: "",
        type: "object",
        depend: {
          id: "tabs",
          value: ["S4"],
        },
        properties: {
          S4_G1: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 0,
            },
            required: ["title", "summary", "url"],
            properties: {
              title: {
                title: "Title",
                type: "string",
              },
              summary: {
                title: "Description",
                type: "string",
              },
              url: {
                title: "URL",
                type: "string",
                format: "url",
              },
            },
          },
          S4_G2: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 1,
            },
            required: ["headquarter", "geoCoverageType"],
            properties: {
              headquarter: {
                title: "In which country are you headquarters?",
                enum: [],
              },
              geoCoverageType: {
                title: "What is the geographical coverage of your Entity?",
                type: "string",
                enum: geoCoverageTypeOptions.map((x) => x.toLowerCase()),
                enumNames: geoCoverageTypeOptions,
              },
              subnationalArea: {
                title:
                  "Please indicate if your Entity operates in a Subnational area only",
                type: "string",
              },
            },
          },
          S4_G3: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 2,
            },
            required: ["tags"],
            properties: {
              tags: {
                title: "Tags",
                enum: [],
              },
            },
          },
          S4_G4: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 3,
            },
            required: [""],
            properties: {
              image: {
                title: "Image",
                type: "string",
                format: "data-url",
              },
              banner: {
                title: "Banner",
                type: "string",
                format: "data-url",
              },
            },
          },
          S4_G5: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 4,
            },
            required: ["orgName", "newCompanyName", "newCompanyHeadquarter"],
            properties: {
              orgName: {
                title: "Search for a GPML Member Entity",
                enum: [],
              },
              companyName: {
                title: "Is your Entity not a GPML Member yet?",
                enum: [],
              },
              newCompanyName: {
                depend: {
                  id: "companyName",
                  value: [-1],
                },
                title: "Entity Name",
                type: "string",
              },
              newCompanyHeadquarter: {
                depend: {
                  id: "companyName",
                  value: [-1],
                },
                title: "In which country are your headquarters?",
                enum: [],
              },
            },
          },
        },
      },
      S5: {
        title: "",
        type: "object",
        depend: {
          id: "tabs",
          value: ["S5"],
        },
        properties: {
          S5_G1: {
            title: "",
            type: "object",
            required: [""],
            properties: {
              S5_G1_17: {
                title: "PUBLICATION YEAR",
                type: "string",
              },
            },
          },
        },
      },
    },
  },
  capacity_building: {
    type: "object",
    version: "2",
    label: "capacity_building",
    properties: {
      S2: {
        title: "",
        type: "object",
        depend: {
          id: "tabs",
          value: ["S2"],
        },
        required: ["S2_1"],
        properties: {
          S2_1: {
            title: "Are you directly managing this resource?",
            type: "string",
            enum: ["1-0", "1-1"],
            enumNames: [
              "You are granting editing and deleting rights ",
              "You are categorized as a submitter ",
            ],
          },
          "S2_G1_1.1": {
            title:
              "Please select other individuals that will support in managing the resource.",
            type: "string",
            enum: [],
            enumNames: [],
          },
        },
      },
      S4: {
        title: "",
        type: "object",
        depend: {
          id: "tabs",
          value: ["S4"],
        },
        properties: {
          S4_G1: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 0,
            },
            required: ["title", "summary", "url"],
            properties: {
              title: {
                title: "Title",
                type: "string",
              },
              summary: {
                title: "Description",
                type: "string",
              },
              url: {
                title: "URL",
                type: "string",
                format: "url",
              },
            },
          },
          S4_G2: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 1,
            },
            required: ["headquarter", "geoCoverageType"],
            properties: {
              headquarter: {
                title: "In which country are you headquarters?",
                enum: [],
              },
              geoCoverageType: {
                title: "What is the geographical coverage of your Entity?",
                type: "string",
                enum: geoCoverageTypeOptions.map((x) => x.toLowerCase()),
                enumNames: geoCoverageTypeOptions,
              },
              subnationalArea: {
                title:
                  "Please indicate if your Entity operates in a Subnational area only",
                type: "string",
              },
            },
          },
          S4_G3: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 2,
            },
            required: ["tags"],
            properties: {
              tags: {
                title: "Tags",
                enum: [],
              },
            },
          },
          S4_G4: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 3,
            },
            required: [""],
            properties: {
              image: {
                title: "Image",
                type: "string",
                format: "data-url",
              },
              banner: {
                title: "Banner",
                type: "string",
                format: "data-url",
              },
            },
          },
          S4_G5: {
            title: "",
            type: "object",
            depend: {
              id: "steps",
              value: 4,
            },
            required: ["orgName", "newCompanyName", "newCompanyHeadquarter"],
            properties: {
              orgName: {
                title: "Search for a GPML Member Entity",
                enum: [],
              },
              companyName: {
                title: "Is your Entity not a GPML Member yet?",
                enum: [],
              },
              newCompanyName: {
                depend: {
                  id: "companyName",
                  value: [-1],
                },
                title: "Entity Name",
                type: "string",
              },
              newCompanyHeadquarter: {
                depend: {
                  id: "companyName",
                  value: [-1],
                },
                title: "In which country are your headquarters?",
                enum: [],
              },
            },
          },
        },
      },
      S5: {
        title: "",
        type: "object",
        depend: {
          id: "tabs",
          value: ["S5"],
        },
        properties: {
          S5_G1: {
            title: "",
            type: "object",
            required: [""],
            properties: {
              S5_G1_17: {
                title: "PUBLICATION YEAR",
                type: "string",
              },
            },
          },
        },
      },
    },
  },
};
