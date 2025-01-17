import { saveAs } from "file-saver";
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  WidthType,
} from "docx";

export const useExportToWord = () => {
  const exportToWord = (generatedSchedule) => {
    try {
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              new Paragraph({
                text: "Escala",
                heading: "Heading1",
                alignment: AlignmentType.CENTER,
              }),

              ...generatedSchedule
                .map((schedule, index) => [
                  new Table({
                    width: {
                      size: 100,
                      type: WidthType.PERCENTAGE,
                    },
                    rows: [
                      new TableRow({
                        children: [
                          new TableCell({
                            columnSpan: 5,
                            children: [
                              new Paragraph({
                                text: `Data da Escala: ${schedule.date}`,
                                alignment: AlignmentType.CENTER,
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),

                  new Table({
                    width: {
                      size: 100,
                      type: WidthType.PERCENTAGE,
                    },
                    rows: [
                      new TableRow({
                        children: [
                          new TableCell({
                            width: { size: 10, type: WidthType.PERCENTAGE },
                            children: [
                              new Paragraph({
                                text: "Graduação",
                                alignment: AlignmentType.CENTER,
                              }),
                            ],
                          }),
                          new TableCell({
                            width: { size: 30, type: WidthType.PERCENTAGE },
                            children: [
                              new Paragraph({
                                text: "Nome",
                                alignment: AlignmentType.CENTER,
                              }),
                            ],
                          }),
                          new TableCell({
                            width: { size: 10, type: WidthType.PERCENTAGE },
                            children: [
                              new Paragraph({
                                text: "RG",
                                alignment: AlignmentType.CENTER,
                              }),
                            ],
                          }),
                          new TableCell({
                            width: { size: 10, type: WidthType.PERCENTAGE },
                            children: [
                              new Paragraph({
                                text: "NF",
                                alignment: AlignmentType.CENTER,
                              }),
                            ],
                          }),
                          new TableCell({
                            width: { size: 10, type: WidthType.PERCENTAGE },
                            children: [
                              new Paragraph({
                                text: "Motorista",
                                alignment: AlignmentType.CENTER,
                              }),
                            ],
                          }),
                        ],
                      }),

                      ...schedule.assignedUsers.map((user) => {
                        return new TableRow({
                          children: [
                            new TableCell({
                              width: { size: 10, type: WidthType.PERCENTAGE },
                              children: [
                                new Paragraph({
                                  text: user.rank || "N/A",
                                  alignment: AlignmentType.CENTER,
                                }),
                              ],
                            }),
                            new TableCell({
                              width: { size: 30, type: WidthType.PERCENTAGE },
                              children: [
                                new Paragraph({
                                  text: user.displayName || "N/A",
                                  alignment: AlignmentType.CENTER,
                                }),
                              ],
                            }),
                            new TableCell({
                              width: { size: 10, type: WidthType.PERCENTAGE },
                              children: [
                                new Paragraph({
                                  text: user.rg || "N/A",
                                  alignment: AlignmentType.CENTER,
                                }),
                              ],
                            }),
                            new TableCell({
                              width: { size: 10, type: WidthType.PERCENTAGE },
                              children: [
                                new Paragraph({
                                  text: user.nf || "N/A",
                                  alignment: AlignmentType.CENTER,
                                }),
                              ],
                            }),
                            new TableCell({
                              width: { size: 10, type: WidthType.PERCENTAGE },
                              children: [
                                new Paragraph({
                                  text: user.motorista || "N/A",
                                  alignment: AlignmentType.CENTER,
                                }),
                              ],
                            }),
                          ],
                        });
                      }),
                    ],
                  }),

                  new Table({
                    width: {
                      size: 100,
                      type: WidthType.PERCENTAGE,
                    },
                    rows: [
                      new TableRow({
                        children: [
                          new TableCell({
                            columnSpan: 5,
                            children: [
                              new Paragraph({
                                text: "",
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                ])
                .flat(),
            ],
          },
        ],
      });

      // Gerar o arquivo .docx
      Packer.toBlob(doc)
        .then((blob) => {
          saveAs(blob, "escala_simples.docx");
        })
        .catch((error) => {
          console.error("Erro ao gerar o arquivo Word:", error);
          alert("Erro ao gerar o documento Word. Tente novamente.");
        });
    } catch (error) {
      console.error("Erro ao criar o documento:", error);
      alert("Erro inesperado ao tentar gerar o documento.");
    }
  };

  return { exportToWord };
};
