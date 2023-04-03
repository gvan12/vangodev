// pages/api/generate-storybook.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const VANGO_KEY = process.env.VANGO_KEY;

const openai = new OpenAIApi(configuration);

const generateStorybookComponent = async (componentCode: string) => {
  console.log("Generating Storybook component...");
  const conversation: ChatCompletionRequestMessage[] = [
    {
      role: "system",
      content: `You are an AI programming assistant that converts React components into Storybook components.
      - Follow the user's requirements carefully & to the letter.
      - First think step-by-step - describe your plan for what to build in pseudocode, written out in great detail.
      - Then output the code in a single code block.
      - Minimize any other prose.`,
    },
    {
      role: "system",
      content:
        "Only respond with the Storybook component code as a string no matter what",
    },
    {
      role: "system",
      content: `Here is a simple example of a React Storybook component written in Typescript:
          import { Typography } from '@mui/material'
import { Meta, Story } from '@storybook/react'

import { Link, LinkProps } from './Link'

export default {
  title: 'Shared/Link',
  component: Link,
  includeStories: /^[A-Z]/,
  argTypes: {},
} as Meta

const Template: Story<LinkProps> = ({ ...args }) => {
  return <Link {...args} />
}
export const Default = Template.bind({})
Default.args = {
  to: '/home',
  children: <>Link Text</>,
}

const WithinTypographyTemplate: Story<LinkProps> = ({ ...args }) => {
  return (
    <>
      <Typography variant="h3" mb={3}>
        This is a <Link {...args}>link</Link> test inside a typography header
      </Typography>
      <Typography>
        This is a <Link {...args}>link</Link> test inside regular body typography.
      </Typography>
    </>
  )
}
export const WithinTypography = WithinTypographyTemplate.bind({})
WithinTypography.args = {
  to: '/home',
  children: <>Link Text</>,
}
          `,
    },
    {
      role: "user",
      content: `Create a Storybook component for this React component:\n\n${componentCode}`,
    },
  ];
  console.log("calling OPENAI...");

  const { data, status } = await openai.createChatCompletion({
    model: "gpt-4",
    messages: conversation,
  });

  if (status !== 200) {
    throw new Error("OpenAI API call failed.");
  }
  //@ts-ignore
  const generatedStorybookCode = data.choices[0].message.content.trim();

  return generatedStorybookCode;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { componentCode } = req.body;
    const { vangoKey } = req.headers;

    if (vangoKey !== VANGO_KEY) {
      res.status(401).json({ message: "Unauthorized." });
      return;
    }

    if (!componentCode) {
      res.status(400).json({ message: "Component code is required." });
      return;
    }

    try {
      const storybookComponentCode = await generateStorybookComponent(
        componentCode as string
      );
      res.status(200).json({ storybookCode: storybookComponentCode });
    } catch (error) {
      console.log("error", error);
      res
        .status(500)
        .json({ message: "Error generating Storybook component." });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
