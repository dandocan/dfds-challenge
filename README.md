# Frontend Code Challenge - Solution by Dan-Cristian VIlcu

The application is built using NextJS, TypeScript, Prisma, React Query, Tailwind, Zod, React Hook Form, and [https://ui.shadcn.com/](https://ui.shadcn.com/) for ready-made components. Alongside the 4 tasks, I also solved a few bugs and inconsistencies present.

### How to Start the Project

- Copy `.env.example` to `.env`
- Run `yarn db:reset`, `npm run db:reset`, or `pnpm db:reset`
- Start the project with `yarn dev`, `npm run dev`, or `pnpm dev`

The Swagger documentation for the Mock API is available at:
[http://localhost:3000/api-doc](http://localhost:3000/api-doc)

## Potential Improvements

There are several improvements that I wanted to make that I felt deviated too much from the original's challenge intention or didn't add enough considering the scope of things. These are as follows:

- SSG or SSR implementation: Either one of these would help with the user experience through speed and would boost the SEO. Even though the voyages need to be updated with every new one created or deleted, the voyage list could still be part of the page's static props/server-side props and serve as the initial data for useQuery.
- Mobile design: Tables are usually a really bad experience on mobile and I believe this could be avoided here. My solution would be to watch for a mobile screen size and use an alternative layout for the data in that case.
- Input type="datetime-local": I would have preferred to use this component instead of the custom DateTimePopover, due to better integration with RHF and cleaner functionality. Still, I wanted to work within the bonus challenge.
- Pre-commit and -push hooks with husky: Super useful, but not in a small solo challenge.
- Plop component generation: not particularly relevant in a small project, very useful beyond that.
- Automated testing: Very nice to have, particularly as project gets bigger. Can be reserved specifically for complicated components. I'd recommend having it as part of the template for any generated component.

## Bugs solved not directly related to the tasks

- Bad DateTime format in TABLE_DATE_FORMAT: this format had "HH:ss" and I assumed (hopefully correctly) that minutes are more importnat than seconds, so I changed it to "HH:mm"
- /api/voyage/create didn't JSON.parse the body
- Double POST method check in /api/voyage/create

## Caveats

- Left in the random delete endpoint failure for testing reasons.
- Some of the error displaying and dismissing for RFH is inconsistent, particularly because of the custome DateTimePopover.
