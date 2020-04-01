const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");
const sass = require("sass");
const { minify } = require("html-minifier");

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];
const colors = [
  "#2188ff",
  "#005cc5",
  "#34d058",
  "#176f2c",
  "#b392f0",
  "#4c2889",
  "#dbab09",
  "#fb8532",
  "#d15704",
  "#f97583",
  "#b31d28",
  "#f692ce",
  "#b93a86"
];

function render(resume) {
  const template = fs.readFileSync(
    path.join(__dirname, "resume.handlebars"),
    "utf-8"
  );

  const css = sass
    .renderSync({
      file: path.join(__dirname, "style.scss"),
      includePaths: [path.join(require.resolve("@primer/css"), "../../../..")]
    })
    .css.toString("utf8");

  return minify(
    Handlebars.compile(template)({
      css,
      resume
    }),
    { minifyCSS: true }
  );
}

Handlebars.registerHelper("findByProperty", (context, prop, value, options) => {
  const match = (context || []).find(x => x[prop] === value);

  if (match) {
    return options.fn(match);
  } else {
    return options.inverse(this);
  }
});

Handlebars.registerHelper("isPropEqual", (context, prop, value, options) => {
  if ((context || {})[prop] == value) {
    return options.fn(context);
  } else {
    return options.inverse(context);
  }
});

Handlebars.registerHelper("randomColor", () => {
  return colors[Math.floor(Math.random() * colors.length)];
});

Handlebars.registerHelper("pinnedExperiences", (resume, options) => {
  const pinned = (resume.work || [])
    .filter(x => x.pinned)
    .map(x => ({
      name: x.position,
      org: x.name,
      date: new Date(x.startDate).getFullYear(),
      summary: x.summary,
      url: x.url,
      tag: "Work",
      color: "#2188ff"
    }))
    .concat(
      (resume.awards || [])
        .filter(x => x.pinned)
        .map(x => ({
          name: x.title,
          org: x.awarder,
          date: new Date(x.date).getFullYear(),
          summary: x.summary,
          url: x.url,
          tag: "Award",
          color: "#dbab09"
        }))
    )
    .concat(
      (resume.projects || [])
        .filter(x => x.pinned)
        .map(x => ({
          name: x.name,
          org: x.entity,
          date: new Date(x.startDate).getFullYear(),
          summary: x.description,
          url: x.url,
          tag: "Project",
          color: "#fb8532"
        }))
    )
    .concat(
      (resume.education || [])
        .filter(x => x.pinned)
        .map(x => ({
          name: `${x.studyType} · ${x.area}`,
          org: x.institution,
          date: new Date(x.endDate).getFullYear(),
          summary: x.summary,
          url: x.url,
          tag: "Education",
          color: "#b392f0"
        }))
    )
    .concat(
      (resume.volunteer || [])
        .filter(x => x.pinned)
        .map(x => ({
          name: x.position,
          org: x.organization,
          date: new Date(x.startDate).getFullYear(),
          summary: x.summary,
          url: x.url,
          tag: "Volunteer",
          color: "#34d058"
        }))
    );

  if (!pinned.length) {
    return options.inverse(this);
  }

  const pre = `<section class="mt-4" aria-labelledby="section-1-header">
  <h2 id="section-1-header" class="f4 mb-2 text-normal">
    Pinned Experiences
  </h2>
  <ul class="d-flex flex-wrap list-style-none mb-4 gutter-condensed">`;
  const post = `  </ul>
</section>`;

  return pre + pinned.map(options.fn).join("\n") + post;
});

Handlebars.registerHelper("pinnedWritings", (resume, options) => {
  const pinned = (resume.publications || [])
    .filter(x => x.pinned)
    .map(x => ({
      name: x.name,
      org: x.publisher,
      date: new Date(x.releaseDate).getFullYear(),
      summary: x.summary,
      url: x.url,
      tag: x.type || "Publication",
      color: "#f97583"
    }));

  if (!pinned.length) {
    return options.inverse(this);
  }

  const pre = `<section class="mt-4" aria-labelledby="writing">
  <h2 id="writing" class="f4 mb-2 text-normal">
    Pinned Writing
  </h2>
  <ul class="d-flex flex-wrap list-style-none mb-4 gutter-condensed">`;
  const post = `  </ul>
</section>`;

  return pre + pinned.map(options.fn).join("\n") + post;
});

function getExperiences(resume) {
  return (resume.work || [])
    .filter(x => x.startDate)
    .map(x => ({
      ...x,
      name: x.position,
      org: x.name,
      date: new Date(x.startDate),
      summary: x.summary,
      url: x.url,
      tag: "Work",
      color: "#2188ff"
    }))
    .concat(
      (resume.awards || [])
        .filter(x => x.date)
        .map(x => ({
          ...x,
          name: x.title,
          org: x.awarder,
          date: new Date(x.date),
          summary: x.summary,
          url: x.url,
          tag: "Award",
          color: "#dbab09"
        }))
    )
    .concat(
      (resume.projects || [])
        .filter(x => x.startDate)
        .map(x => ({
          ...x,
          name: x.name,
          org: x.entity,
          date: new Date(x.startDate),
          summary: x.description,
          url: x.url,
          tag: "Project",
          color: "#fb8532"
        }))
    )
    .concat(
      (resume.education || [])
        .filter(x => x.endDate)
        .map(x => ({
          ...x,
          name: `${x.studyType} · ${x.area}`,
          org: x.institution,
          date: new Date(x.endDate),
          summary: x.summary,
          url: x.url,
          tag: "Education",
          color: "#b392f0"
        }))
    )
    .concat(
      (resume.volunteer || [])
        .filter(x => x.startDate)
        .map(x => ({
          ...x,
          name: x.position,
          org: x.organization,
          date: new Date(x.startDate),
          summary: x.summary,
          url: x.url,
          tag: "Volunteer",
          color: "#34d058"
        }))
    );
}

Handlebars.registerHelper("experiencesCount", (resume, options) => {
  const experiences = getExperiences(resume);
  return experiences.length;
});

Handlebars.registerHelper("experiencesByMonth", (resume, options) => {
  const experiences = getExperiences(resume);

  if (!experiences.length) {
    return options.inverse(this);
  }

  const byMonth = {};

  experiences.forEach(x => {
    const dateKey = `${x.date.getFullYear()}-${x.date.getMonth()}`;
    if (!byMonth[dateKey]) {
      byMonth[dateKey] = [];
    }
    byMonth[dateKey].push(x);
  });

  const pre = `<section class="activity-listing contribution-activity" aria-labelledby="experiences">
  <h3 id="experiences" class="f4 text-normal mb-2">
    Experience activity
  </h3>`;
  const post = `
</section>`;

  return (
    pre +
    Object.keys(byMonth)
      .sort((a, b) => (a < b ? 1 : -1))
      .map(x =>
        options.fn(byMonth[x], {
          data: {
            month: monthNames[byMonth[x][0].date.getMonth()],
            year: byMonth[x][0].date.getFullYear()
          }
        })
      )
      .join("\n") +
    post
  );
});

module.exports = {
  render
};
