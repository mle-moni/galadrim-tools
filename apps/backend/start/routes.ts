/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import "#adomin/routes/adomin_router";
import router from "@adonisjs/core/services/router";

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import env from "#start/env";
import "./routes/file_uploads.js";

import AdminController from "#controllers/admin/AdminController";
import AuthController from "#controllers/auth/auth_controller";
import BreakActivitiesController from "#controllers/break_activities/BreakActivitiesController";
import BreakTimesController from "#controllers/break_times/BreakTimesController";
import BreakVotesController from "#controllers/break_votes/BreakVotesController";
import BugConnexionsController from "#controllers/bug_connexions/BugConnexionsController";
import CodeNamesGamesController from "#controllers/code_names_games/CodeNamesGamesController";
import DashboardController from "#controllers/dashboard/DashboardController";
import EventsController from "#controllers/events/EventsController";
import GaladrimeursController from "#controllers/galadrimeurs/GaladrimeursController";
import IdeasController from "#controllers/ideas/IdeasController";
import LogsController from "#controllers/logs/LogsController";
import MatricesController from "#controllers/matrices/MatricesController";
import PlatformerResultsController from "#controllers/platformer_results/PlatformerResultsController";
import PortraitGuessGameController from "#controllers/portrait_guess_game/PortraitGuessGameController";
import RestaurantNotesController from "#controllers/restaurant_notes/RestaurantNotesController";
import RestaurantReviewsController from "#controllers/restaurant_reviews/RestaurantReviewsController";
import { showRestaurantRewind } from "#controllers/restaurant_rewinds/showRestaurantRewind";
import RestaurantsController from "#controllers/restaurants/RestaurantsController";
import StatisticsController from "#controllers/statistics/StatisticsController";
import TagsController from "#controllers/tags/TagsController";
import { middleware } from "./kernel.js";

router.get("/", async () => {
    return { service: "galadrim tools backend" };
});

router.post("/login", [AuthController, "login"]);
router.get("/forestLogin", [AuthController, "forestLogin"]);
router.post("/getOtp", [AuthController, "getOtp"]);

router
    .group(() => {
        router.post("/logout", [AuthController, "logout"]);

        router.resource("events", EventsController).apiOnly();
        router.get("/allEvents", [EventsController, "all"]);
        router.get("/availableRooms", [EventsController, "availableRooms"]);

        router.resource("tags", TagsController).apiOnly();
        router.resource("restaurants", RestaurantsController).apiOnly();
        router.post("createOrUpdateRestaurantChoice", [
            RestaurantsController,
            "createOrUpdateChoice",
        ]);

        router.get("/notes/mine", [RestaurantNotesController, "mine"]);
        router.resource("notes", RestaurantNotesController).apiOnly();

        router.resource("ideas", IdeasController).apiOnly();
        router.post("createOrUpdateIdeaVote", [IdeasController, "createOrUpdateVote"]);
        router.post("createIdeaComment", [IdeasController, "createComment"]);

        router.get("/me", [AuthController, "me"]);
        router.post("/createApiToken", [AuthController, "createApiToken"]);
        router.post("/changePassword", [AuthController, "changePassword"]);
        router.post("/updateProfile", [AuthController, "updateProfile"]);
        router.post("/updateTheme", [AuthController, "updateTheme"]);

        router.get("/users", [GaladrimeursController, "users"]);

        router.post("/updateNotificationsSettings", [
            AuthController,
            "updateNotificationsSettings",
        ]);
        router.post("/readNotifications", [AuthController, "readNotifications"]);

        router.resource("matrices", MatricesController).apiOnly();

        router.post("codeNamesGames/addRound/:id", [CodeNamesGamesController, "addRound"]);
        router.resource("codeNamesGames", CodeNamesGamesController).apiOnly();
        router.resource("portraitGuessGame", PortraitGuessGameController).apiOnly();

        router.resource("restaurants/:restaurantId/reviews", RestaurantReviewsController).apiOnly();
        router.get("rewind/:id?", showRestaurantRewind);
        router.resource("bugConnexions", BugConnexionsController).apiOnly();
        router.get("/caddyLogs/:id", [LogsController, "showCaddyLogs"]);
        router.get("/atopLogs/:id", [LogsController, "showAtopLogs"]);
    })
    .use(middleware.auth({ guards: ["web", "api"] }));

router.post("portraitGuessGame/refresh", [PortraitGuessGameController, "refresh"]);
router.post("/caddyLogs", [LogsController, "storeCaddyLogs"]);
router.post("/atopLogs", [LogsController, "storeAtopLogs"]);

router
    .group(() => {
        router.resource("votes", BreakVotesController).apiOnly();
        router.resource("activities", BreakActivitiesController).apiOnly();
        router.resource("times", BreakTimesController).apiOnly();
    })
    .prefix("galabreak")
    .use(middleware.auth({ guards: ["web", "api"] }));

router.get("/galadrimeurs", "galadrimeurs/GaladrimeursController.index");

router
    .group(() => {
        router.get("/rooms", [StatisticsController, "favoriteRoom"]);
        router.get("/time", [StatisticsController, "time"]);
        router.get("/amount", [StatisticsController, "amount"]);
    })
    .use(middleware.auth({ guards: ["web", "api"] }))
    .prefix("statistics");

router
    .group(() => {
        router
            .post("/createUser", [AdminController, "createUser"])
            .use(middleware.rights(["USER_ADMIN"]));
        router
            .get("/userRights", [AdminController, "userRights"])
            .use(middleware.rights(["RIGHTS_ADMIN"]));
        router
            .put("/userRights", [AdminController, "editUserRights"])
            .use(middleware.rights(["RIGHTS_ADMIN"]));
        router
            .post("/createNotification", [AdminController, "createNotification"])
            .use(middleware.rights(["NOTIFICATION_ADMIN"]));
        router.get("/dashboard", [DashboardController, "index"]);
    })
    .use(middleware.auth({ guards: ["web", "api"] }))
    .prefix("admin");

router.get("authRedirect/:target", ({ response, request }) => {
    const target = request.param("target");
    return response.redirect(`${env.get("FRONTEND_URL")}/login?redirect=${target}`);
});

router
    .group(() => {
        router.get("tournois", [PlatformerResultsController, "index"]);
    })
    .prefix("games")
    .use(middleware.auth({ guards: ["web", "api"] }));
