# Developer Setup

We use Macs for development, and I'm assuming that you also have one. If you are
using a Windows PC it should be sufficient to have some sort `containerd`
runtime and `node` with `npm` installed. In production we use the most recent
LTS release.

## Prerequisites

I've included a Brewfile with the MacOS prerequisites. If you don't already have
it, follow the install instructions at [https://brew.sh](https://brew.sh/). Once
homebrew is installed you can open a terminal to this repo and install the
prerequisites with the command.

```bash
brew bundle install
```

This will install four packages:

- colima: this is a FOSS replacement for Docker Desktop.
- podman and podman-compose: these are FOSS equivalents of the docker and
  docker-compose command line tools
- volta: a tool to manage JavaScript runtimes.

### Colima setup

The first thing you need to do is start the colima service for the first time. I
recommend editing the configuration file first to get a feel for the options.

```bash
colima start --edit
```

This will launch your editor with the configuration file loaded. Here you can
customize the amount of system resources the runtime uses. I think I doubled the
amount of RAM that it was allowed to use because I ran into out of memory errors
when working on SRS because FormsFlow is a memory hog.

One important tweak I recommend is changing the VM backend from `qemu` to `vz`.
`vz` is the MacOS native virtualization runtime, and I find that it works more
reliably where data volumes are involved. This is important for the database.
`qemu` might work ok as well. The configuration file is stored at
`~/.colima/default/colima.yaml`.

Aside: the `colima.yaml` file allows you to configure kubernetes support. If
you install helm from homebrew you can (and I have) deploy your helm charts
locally for learning purposes.

Once that is done save and quit the editor. It should now download the necessary
files and start the colima service. If you don't want to have to run
`colima start` every time your computer restarts, bring down colima with
`colima stop` and install it as a system service with
`brew services start colima`.

If you ever need to recover from disaster, you can use the following commands
to reset colima:

```bash
brew services stop colima
colima delete
```

If you just want to tweak the settings just edit the `yaml` file and run:

```bash
brew services restart colima
```

### Volta setup

Volta is very simple. Why do I use it instead of just installing `node` and
`npm` from homebrew? It's very fast and I use different versions of
`node` for different projects. The usage guide is at [https://docs.volta.sh](https://docs.volta.sh). For this project all you need to do is make sure that
the volta binaries are in your `$PATH`. If you use MacOS' default `zsh` shell
you can add this to your `~/.zshrc`:

```bash
PATH="${HOME}/.volta/bin:${PATH}"
```

and restart your terminal. If you have changed your shell to something other
than `zsh` then you probably also know how to do this for your shell of choice.

## Running the project

I've gone through some pains to ensure that this works both when running the
project using `npm` and `podman`. In any case you need a PostgreSQL database
running at `localhost:5432`. I'm not going to give instructions to run the
database outside of a container because, in my experience, that is a recipe for
disaster.

Before anything else, you need to install the node packages for the project:

```bash
cd backend
npm i
cd ../frontend
npm i
cd ..
```

TODO: There must be a tool that will traverse the applications in a monorepo and
ensures that all the npm packages are installed and up to date. Look into this.

Then copy and edit the necessary environment files. These get sourced every time
the respective application is run. Every time you see a case of `process.env...`
you should probably have a sane default in your `.env` file.

```bash
cd backend
cp .env.example .env
cd ../frontend
cp .env.example .env
```

### Using podman

Bring up the entire service:

```bash
podman-compose up -d
```

Once this is complete you should be able to browse to `http://localhost:3000`.

### Using npm

Open a terminal and bring up the database:

```bash
podman-compose up database
```

Open another terminal and run the backend:

```bash
cd backend
npm run prisma:migrate
npm run prisma:seed
npm run start:dev
```

Open yet another terminal and run the frontend:

```bash
cd frontend
npm run dev
```

Once everything is running the vite server should give you a url to browse to
like `http://localhost:5173`. Note that it does not run on port 3000 by
default. This is an important difference between running locally and in podman.
Podman uses internal networking to route api calls from the frontend to the
backend, but when running locally (on the same host) they need to use different
ports.
