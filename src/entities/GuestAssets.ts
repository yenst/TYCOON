import Phaser from "phaser";
import { GUEST_VARIANT_COUNT } from "../config";

import v1Se from "../../public/assets/guests/v1/se.png" with { type: "file" };
import v1Sw from "../../public/assets/guests/v1/sw.png" with { type: "file" };
import v1Ne from "../../public/assets/guests/v1/ne.png" with { type: "file" };
import v1Nw from "../../public/assets/guests/v1/nw.png" with { type: "file" };
import v2Se from "../../public/assets/guests/v2/se.png" with { type: "file" };
import v2Sw from "../../public/assets/guests/v2/sw.png" with { type: "file" };
import v2Ne from "../../public/assets/guests/v2/ne.png" with { type: "file" };
import v2Nw from "../../public/assets/guests/v2/nw.png" with { type: "file" };
import v3Se from "../../public/assets/guests/v3/se.png" with { type: "file" };
import v3Sw from "../../public/assets/guests/v3/sw.png" with { type: "file" };
import v3Ne from "../../public/assets/guests/v3/ne.png" with { type: "file" };
import v3Nw from "../../public/assets/guests/v3/nw.png" with { type: "file" };
import v4Se from "../../public/assets/guests/v4/se.png" with { type: "file" };
import v4Sw from "../../public/assets/guests/v4/sw.png" with { type: "file" };
import v4Ne from "../../public/assets/guests/v4/ne.png" with { type: "file" };
import v4Nw from "../../public/assets/guests/v4/nw.png" with { type: "file" };
import v5Se from "../../public/assets/guests/v5/se.png" with { type: "file" };
import v5Sw from "../../public/assets/guests/v5/sw.png" with { type: "file" };
import v5Ne from "../../public/assets/guests/v5/ne.png" with { type: "file" };
import v5Nw from "../../public/assets/guests/v5/nw.png" with { type: "file" };
import v6Se from "../../public/assets/guests/v6/se.png" with { type: "file" };
import v6Sw from "../../public/assets/guests/v6/sw.png" with { type: "file" };
import v6Ne from "../../public/assets/guests/v6/ne.png" with { type: "file" };
import v6Nw from "../../public/assets/guests/v6/nw.png" with { type: "file" };
import v7Se from "../../public/assets/guests/v7/se.png" with { type: "file" };
import v7Sw from "../../public/assets/guests/v7/sw.png" with { type: "file" };
import v7Ne from "../../public/assets/guests/v7/ne.png" with { type: "file" };
import v7Nw from "../../public/assets/guests/v7/nw.png" with { type: "file" };
import v8Se from "../../public/assets/guests/v8/se.png" with { type: "file" };
import v8Sw from "../../public/assets/guests/v8/sw.png" with { type: "file" };
import v8Ne from "../../public/assets/guests/v8/ne.png" with { type: "file" };
import v8Nw from "../../public/assets/guests/v8/nw.png" with { type: "file" };
import v9Se from "../../public/assets/guests/v9/se.png" with { type: "file" };
import v9Sw from "../../public/assets/guests/v9/sw.png" with { type: "file" };
import v9Ne from "../../public/assets/guests/v9/ne.png" with { type: "file" };
import v9Nw from "../../public/assets/guests/v9/nw.png" with { type: "file" };
import v10Se from "../../public/assets/guests/v10/se.png" with { type: "file" };
import v10Sw from "../../public/assets/guests/v10/sw.png" with { type: "file" };
import v10Ne from "../../public/assets/guests/v10/ne.png" with { type: "file" };
import v10Nw from "../../public/assets/guests/v10/nw.png" with { type: "file" };

// Walk animation frames — one 6-frame set per (variant, direction).
import v1WalkSe0 from "../../public/assets/guests/v1/walk/se_00.png" with { type: "file" };
import v1WalkSe1 from "../../public/assets/guests/v1/walk/se_01.png" with { type: "file" };
import v1WalkSe2 from "../../public/assets/guests/v1/walk/se_02.png" with { type: "file" };
import v1WalkSe3 from "../../public/assets/guests/v1/walk/se_03.png" with { type: "file" };
import v1WalkSe4 from "../../public/assets/guests/v1/walk/se_04.png" with { type: "file" };
import v1WalkSe5 from "../../public/assets/guests/v1/walk/se_05.png" with { type: "file" };
import v1WalkSw0 from "../../public/assets/guests/v1/walk/sw_00.png" with { type: "file" };
import v1WalkSw1 from "../../public/assets/guests/v1/walk/sw_01.png" with { type: "file" };
import v1WalkSw2 from "../../public/assets/guests/v1/walk/sw_02.png" with { type: "file" };
import v1WalkSw3 from "../../public/assets/guests/v1/walk/sw_03.png" with { type: "file" };
import v1WalkSw4 from "../../public/assets/guests/v1/walk/sw_04.png" with { type: "file" };
import v1WalkSw5 from "../../public/assets/guests/v1/walk/sw_05.png" with { type: "file" };
import v1WalkNe0 from "../../public/assets/guests/v1/walk/ne_00.png" with { type: "file" };
import v1WalkNe1 from "../../public/assets/guests/v1/walk/ne_01.png" with { type: "file" };
import v1WalkNe2 from "../../public/assets/guests/v1/walk/ne_02.png" with { type: "file" };
import v1WalkNe3 from "../../public/assets/guests/v1/walk/ne_03.png" with { type: "file" };
import v1WalkNe4 from "../../public/assets/guests/v1/walk/ne_04.png" with { type: "file" };
import v1WalkNe5 from "../../public/assets/guests/v1/walk/ne_05.png" with { type: "file" };
import v1WalkNw0 from "../../public/assets/guests/v1/walk/nw_00.png" with { type: "file" };
import v1WalkNw1 from "../../public/assets/guests/v1/walk/nw_01.png" with { type: "file" };
import v1WalkNw2 from "../../public/assets/guests/v1/walk/nw_02.png" with { type: "file" };
import v1WalkNw3 from "../../public/assets/guests/v1/walk/nw_03.png" with { type: "file" };
import v1WalkNw4 from "../../public/assets/guests/v1/walk/nw_04.png" with { type: "file" };
import v1WalkNw5 from "../../public/assets/guests/v1/walk/nw_05.png" with { type: "file" };

import v3WalkSe0 from "../../public/assets/guests/v3/walk/se_00.png" with { type: "file" };
import v3WalkSe1 from "../../public/assets/guests/v3/walk/se_01.png" with { type: "file" };
import v3WalkSe2 from "../../public/assets/guests/v3/walk/se_02.png" with { type: "file" };
import v3WalkSe3 from "../../public/assets/guests/v3/walk/se_03.png" with { type: "file" };
import v3WalkSe4 from "../../public/assets/guests/v3/walk/se_04.png" with { type: "file" };
import v3WalkSe5 from "../../public/assets/guests/v3/walk/se_05.png" with { type: "file" };
import v3WalkSw0 from "../../public/assets/guests/v3/walk/sw_00.png" with { type: "file" };
import v3WalkSw1 from "../../public/assets/guests/v3/walk/sw_01.png" with { type: "file" };
import v3WalkSw2 from "../../public/assets/guests/v3/walk/sw_02.png" with { type: "file" };
import v3WalkSw3 from "../../public/assets/guests/v3/walk/sw_03.png" with { type: "file" };
import v3WalkSw4 from "../../public/assets/guests/v3/walk/sw_04.png" with { type: "file" };
import v3WalkSw5 from "../../public/assets/guests/v3/walk/sw_05.png" with { type: "file" };
import v3WalkNe0 from "../../public/assets/guests/v3/walk/ne_00.png" with { type: "file" };
import v3WalkNe1 from "../../public/assets/guests/v3/walk/ne_01.png" with { type: "file" };
import v3WalkNe2 from "../../public/assets/guests/v3/walk/ne_02.png" with { type: "file" };
import v3WalkNe3 from "../../public/assets/guests/v3/walk/ne_03.png" with { type: "file" };
import v3WalkNe4 from "../../public/assets/guests/v3/walk/ne_04.png" with { type: "file" };
import v3WalkNe5 from "../../public/assets/guests/v3/walk/ne_05.png" with { type: "file" };
import v3WalkNw0 from "../../public/assets/guests/v3/walk/nw_00.png" with { type: "file" };
import v3WalkNw1 from "../../public/assets/guests/v3/walk/nw_01.png" with { type: "file" };
import v3WalkNw2 from "../../public/assets/guests/v3/walk/nw_02.png" with { type: "file" };
import v3WalkNw3 from "../../public/assets/guests/v3/walk/nw_03.png" with { type: "file" };
import v3WalkNw4 from "../../public/assets/guests/v3/walk/nw_04.png" with { type: "file" };
import v3WalkNw5 from "../../public/assets/guests/v3/walk/nw_05.png" with { type: "file" };

import v7WalkSe0 from "../../public/assets/guests/v7/walk/se_00.png" with { type: "file" };
import v7WalkSe1 from "../../public/assets/guests/v7/walk/se_01.png" with { type: "file" };
import v7WalkSe2 from "../../public/assets/guests/v7/walk/se_02.png" with { type: "file" };
import v7WalkSe3 from "../../public/assets/guests/v7/walk/se_03.png" with { type: "file" };
import v7WalkSe4 from "../../public/assets/guests/v7/walk/se_04.png" with { type: "file" };
import v7WalkSe5 from "../../public/assets/guests/v7/walk/se_05.png" with { type: "file" };
import v7WalkSw0 from "../../public/assets/guests/v7/walk/sw_00.png" with { type: "file" };
import v7WalkSw1 from "../../public/assets/guests/v7/walk/sw_01.png" with { type: "file" };
import v7WalkSw2 from "../../public/assets/guests/v7/walk/sw_02.png" with { type: "file" };
import v7WalkSw3 from "../../public/assets/guests/v7/walk/sw_03.png" with { type: "file" };
import v7WalkSw4 from "../../public/assets/guests/v7/walk/sw_04.png" with { type: "file" };
import v7WalkSw5 from "../../public/assets/guests/v7/walk/sw_05.png" with { type: "file" };
import v7WalkNe0 from "../../public/assets/guests/v7/walk/ne_00.png" with { type: "file" };
import v7WalkNe1 from "../../public/assets/guests/v7/walk/ne_01.png" with { type: "file" };
import v7WalkNe2 from "../../public/assets/guests/v7/walk/ne_02.png" with { type: "file" };
import v7WalkNe3 from "../../public/assets/guests/v7/walk/ne_03.png" with { type: "file" };
import v7WalkNe4 from "../../public/assets/guests/v7/walk/ne_04.png" with { type: "file" };
import v7WalkNe5 from "../../public/assets/guests/v7/walk/ne_05.png" with { type: "file" };
import v7WalkNw0 from "../../public/assets/guests/v7/walk/nw_00.png" with { type: "file" };
import v7WalkNw1 from "../../public/assets/guests/v7/walk/nw_01.png" with { type: "file" };
import v7WalkNw2 from "../../public/assets/guests/v7/walk/nw_02.png" with { type: "file" };
import v7WalkNw3 from "../../public/assets/guests/v7/walk/nw_03.png" with { type: "file" };
import v7WalkNw4 from "../../public/assets/guests/v7/walk/nw_04.png" with { type: "file" };
import v7WalkNw5 from "../../public/assets/guests/v7/walk/nw_05.png" with { type: "file" };

import v2WalkSe0 from "../../public/assets/guests/v2/walk/se_00.png" with { type: "file" };
import v2WalkSe1 from "../../public/assets/guests/v2/walk/se_01.png" with { type: "file" };
import v2WalkSe2 from "../../public/assets/guests/v2/walk/se_02.png" with { type: "file" };
import v2WalkSe3 from "../../public/assets/guests/v2/walk/se_03.png" with { type: "file" };
import v2WalkSe4 from "../../public/assets/guests/v2/walk/se_04.png" with { type: "file" };
import v2WalkSe5 from "../../public/assets/guests/v2/walk/se_05.png" with { type: "file" };
import v2WalkSw0 from "../../public/assets/guests/v2/walk/sw_00.png" with { type: "file" };
import v2WalkSw1 from "../../public/assets/guests/v2/walk/sw_01.png" with { type: "file" };
import v2WalkSw2 from "../../public/assets/guests/v2/walk/sw_02.png" with { type: "file" };
import v2WalkSw3 from "../../public/assets/guests/v2/walk/sw_03.png" with { type: "file" };
import v2WalkSw4 from "../../public/assets/guests/v2/walk/sw_04.png" with { type: "file" };
import v2WalkSw5 from "../../public/assets/guests/v2/walk/sw_05.png" with { type: "file" };
import v2WalkNe0 from "../../public/assets/guests/v2/walk/ne_00.png" with { type: "file" };
import v2WalkNe1 from "../../public/assets/guests/v2/walk/ne_01.png" with { type: "file" };
import v2WalkNe2 from "../../public/assets/guests/v2/walk/ne_02.png" with { type: "file" };
import v2WalkNe3 from "../../public/assets/guests/v2/walk/ne_03.png" with { type: "file" };
import v2WalkNe4 from "../../public/assets/guests/v2/walk/ne_04.png" with { type: "file" };
import v2WalkNe5 from "../../public/assets/guests/v2/walk/ne_05.png" with { type: "file" };
import v2WalkNw0 from "../../public/assets/guests/v2/walk/nw_00.png" with { type: "file" };
import v2WalkNw1 from "../../public/assets/guests/v2/walk/nw_01.png" with { type: "file" };
import v2WalkNw2 from "../../public/assets/guests/v2/walk/nw_02.png" with { type: "file" };
import v2WalkNw3 from "../../public/assets/guests/v2/walk/nw_03.png" with { type: "file" };
import v2WalkNw4 from "../../public/assets/guests/v2/walk/nw_04.png" with { type: "file" };
import v2WalkNw5 from "../../public/assets/guests/v2/walk/nw_05.png" with { type: "file" };

import v4WalkSe0 from "../../public/assets/guests/v4/walk/se_00.png" with { type: "file" };
import v4WalkSe1 from "../../public/assets/guests/v4/walk/se_01.png" with { type: "file" };
import v4WalkSe2 from "../../public/assets/guests/v4/walk/se_02.png" with { type: "file" };
import v4WalkSe3 from "../../public/assets/guests/v4/walk/se_03.png" with { type: "file" };
import v4WalkSe4 from "../../public/assets/guests/v4/walk/se_04.png" with { type: "file" };
import v4WalkSe5 from "../../public/assets/guests/v4/walk/se_05.png" with { type: "file" };
import v4WalkSw0 from "../../public/assets/guests/v4/walk/sw_00.png" with { type: "file" };
import v4WalkSw1 from "../../public/assets/guests/v4/walk/sw_01.png" with { type: "file" };
import v4WalkSw2 from "../../public/assets/guests/v4/walk/sw_02.png" with { type: "file" };
import v4WalkSw3 from "../../public/assets/guests/v4/walk/sw_03.png" with { type: "file" };
import v4WalkSw4 from "../../public/assets/guests/v4/walk/sw_04.png" with { type: "file" };
import v4WalkSw5 from "../../public/assets/guests/v4/walk/sw_05.png" with { type: "file" };
import v4WalkNe0 from "../../public/assets/guests/v4/walk/ne_00.png" with { type: "file" };
import v4WalkNe1 from "../../public/assets/guests/v4/walk/ne_01.png" with { type: "file" };
import v4WalkNe2 from "../../public/assets/guests/v4/walk/ne_02.png" with { type: "file" };
import v4WalkNe3 from "../../public/assets/guests/v4/walk/ne_03.png" with { type: "file" };
import v4WalkNe4 from "../../public/assets/guests/v4/walk/ne_04.png" with { type: "file" };
import v4WalkNe5 from "../../public/assets/guests/v4/walk/ne_05.png" with { type: "file" };
import v4WalkNw0 from "../../public/assets/guests/v4/walk/nw_00.png" with { type: "file" };
import v4WalkNw1 from "../../public/assets/guests/v4/walk/nw_01.png" with { type: "file" };
import v4WalkNw2 from "../../public/assets/guests/v4/walk/nw_02.png" with { type: "file" };
import v4WalkNw3 from "../../public/assets/guests/v4/walk/nw_03.png" with { type: "file" };
import v4WalkNw4 from "../../public/assets/guests/v4/walk/nw_04.png" with { type: "file" };
import v4WalkNw5 from "../../public/assets/guests/v4/walk/nw_05.png" with { type: "file" };

import v5WalkSe0 from "../../public/assets/guests/v5/walk/se_00.png" with { type: "file" };
import v5WalkSe1 from "../../public/assets/guests/v5/walk/se_01.png" with { type: "file" };
import v5WalkSe2 from "../../public/assets/guests/v5/walk/se_02.png" with { type: "file" };
import v5WalkSe3 from "../../public/assets/guests/v5/walk/se_03.png" with { type: "file" };
import v5WalkSe4 from "../../public/assets/guests/v5/walk/se_04.png" with { type: "file" };
import v5WalkSe5 from "../../public/assets/guests/v5/walk/se_05.png" with { type: "file" };
import v5WalkSw0 from "../../public/assets/guests/v5/walk/sw_00.png" with { type: "file" };
import v5WalkSw1 from "../../public/assets/guests/v5/walk/sw_01.png" with { type: "file" };
import v5WalkSw2 from "../../public/assets/guests/v5/walk/sw_02.png" with { type: "file" };
import v5WalkSw3 from "../../public/assets/guests/v5/walk/sw_03.png" with { type: "file" };
import v5WalkSw4 from "../../public/assets/guests/v5/walk/sw_04.png" with { type: "file" };
import v5WalkSw5 from "../../public/assets/guests/v5/walk/sw_05.png" with { type: "file" };
import v5WalkNe0 from "../../public/assets/guests/v5/walk/ne_00.png" with { type: "file" };
import v5WalkNe1 from "../../public/assets/guests/v5/walk/ne_01.png" with { type: "file" };
import v5WalkNe2 from "../../public/assets/guests/v5/walk/ne_02.png" with { type: "file" };
import v5WalkNe3 from "../../public/assets/guests/v5/walk/ne_03.png" with { type: "file" };
import v5WalkNe4 from "../../public/assets/guests/v5/walk/ne_04.png" with { type: "file" };
import v5WalkNe5 from "../../public/assets/guests/v5/walk/ne_05.png" with { type: "file" };
import v5WalkNw0 from "../../public/assets/guests/v5/walk/nw_00.png" with { type: "file" };
import v5WalkNw1 from "../../public/assets/guests/v5/walk/nw_01.png" with { type: "file" };
import v5WalkNw2 from "../../public/assets/guests/v5/walk/nw_02.png" with { type: "file" };
import v5WalkNw3 from "../../public/assets/guests/v5/walk/nw_03.png" with { type: "file" };
import v5WalkNw4 from "../../public/assets/guests/v5/walk/nw_04.png" with { type: "file" };
import v5WalkNw5 from "../../public/assets/guests/v5/walk/nw_05.png" with { type: "file" };

import v6WalkSe0 from "../../public/assets/guests/v6/walk/se_00.png" with { type: "file" };
import v6WalkSe1 from "../../public/assets/guests/v6/walk/se_01.png" with { type: "file" };
import v6WalkSe2 from "../../public/assets/guests/v6/walk/se_02.png" with { type: "file" };
import v6WalkSe3 from "../../public/assets/guests/v6/walk/se_03.png" with { type: "file" };
import v6WalkSe4 from "../../public/assets/guests/v6/walk/se_04.png" with { type: "file" };
import v6WalkSe5 from "../../public/assets/guests/v6/walk/se_05.png" with { type: "file" };
import v6WalkSw0 from "../../public/assets/guests/v6/walk/sw_00.png" with { type: "file" };
import v6WalkSw1 from "../../public/assets/guests/v6/walk/sw_01.png" with { type: "file" };
import v6WalkSw2 from "../../public/assets/guests/v6/walk/sw_02.png" with { type: "file" };
import v6WalkSw3 from "../../public/assets/guests/v6/walk/sw_03.png" with { type: "file" };
import v6WalkSw4 from "../../public/assets/guests/v6/walk/sw_04.png" with { type: "file" };
import v6WalkSw5 from "../../public/assets/guests/v6/walk/sw_05.png" with { type: "file" };
import v6WalkNe0 from "../../public/assets/guests/v6/walk/ne_00.png" with { type: "file" };
import v6WalkNe1 from "../../public/assets/guests/v6/walk/ne_01.png" with { type: "file" };
import v6WalkNe2 from "../../public/assets/guests/v6/walk/ne_02.png" with { type: "file" };
import v6WalkNe3 from "../../public/assets/guests/v6/walk/ne_03.png" with { type: "file" };
import v6WalkNe4 from "../../public/assets/guests/v6/walk/ne_04.png" with { type: "file" };
import v6WalkNe5 from "../../public/assets/guests/v6/walk/ne_05.png" with { type: "file" };
import v6WalkNw0 from "../../public/assets/guests/v6/walk/nw_00.png" with { type: "file" };
import v6WalkNw1 from "../../public/assets/guests/v6/walk/nw_01.png" with { type: "file" };
import v6WalkNw2 from "../../public/assets/guests/v6/walk/nw_02.png" with { type: "file" };
import v6WalkNw3 from "../../public/assets/guests/v6/walk/nw_03.png" with { type: "file" };
import v6WalkNw4 from "../../public/assets/guests/v6/walk/nw_04.png" with { type: "file" };
import v6WalkNw5 from "../../public/assets/guests/v6/walk/nw_05.png" with { type: "file" };

import v8WalkSe0 from "../../public/assets/guests/v8/walk/se_00.png" with { type: "file" };
import v8WalkSe1 from "../../public/assets/guests/v8/walk/se_01.png" with { type: "file" };
import v8WalkSe2 from "../../public/assets/guests/v8/walk/se_02.png" with { type: "file" };
import v8WalkSe3 from "../../public/assets/guests/v8/walk/se_03.png" with { type: "file" };
import v8WalkSe4 from "../../public/assets/guests/v8/walk/se_04.png" with { type: "file" };
import v8WalkSe5 from "../../public/assets/guests/v8/walk/se_05.png" with { type: "file" };
import v8WalkSw0 from "../../public/assets/guests/v8/walk/sw_00.png" with { type: "file" };
import v8WalkSw1 from "../../public/assets/guests/v8/walk/sw_01.png" with { type: "file" };
import v8WalkSw2 from "../../public/assets/guests/v8/walk/sw_02.png" with { type: "file" };
import v8WalkSw3 from "../../public/assets/guests/v8/walk/sw_03.png" with { type: "file" };
import v8WalkSw4 from "../../public/assets/guests/v8/walk/sw_04.png" with { type: "file" };
import v8WalkSw5 from "../../public/assets/guests/v8/walk/sw_05.png" with { type: "file" };
import v8WalkNe0 from "../../public/assets/guests/v8/walk/ne_00.png" with { type: "file" };
import v8WalkNe1 from "../../public/assets/guests/v8/walk/ne_01.png" with { type: "file" };
import v8WalkNe2 from "../../public/assets/guests/v8/walk/ne_02.png" with { type: "file" };
import v8WalkNe3 from "../../public/assets/guests/v8/walk/ne_03.png" with { type: "file" };
import v8WalkNe4 from "../../public/assets/guests/v8/walk/ne_04.png" with { type: "file" };
import v8WalkNe5 from "../../public/assets/guests/v8/walk/ne_05.png" with { type: "file" };
import v8WalkNw0 from "../../public/assets/guests/v8/walk/nw_00.png" with { type: "file" };
import v8WalkNw1 from "../../public/assets/guests/v8/walk/nw_01.png" with { type: "file" };
import v8WalkNw2 from "../../public/assets/guests/v8/walk/nw_02.png" with { type: "file" };
import v8WalkNw3 from "../../public/assets/guests/v8/walk/nw_03.png" with { type: "file" };
import v8WalkNw4 from "../../public/assets/guests/v8/walk/nw_04.png" with { type: "file" };
import v8WalkNw5 from "../../public/assets/guests/v8/walk/nw_05.png" with { type: "file" };

import v9WalkSe0 from "../../public/assets/guests/v9/walk/se_00.png" with { type: "file" };
import v9WalkSe1 from "../../public/assets/guests/v9/walk/se_01.png" with { type: "file" };
import v9WalkSe2 from "../../public/assets/guests/v9/walk/se_02.png" with { type: "file" };
import v9WalkSe3 from "../../public/assets/guests/v9/walk/se_03.png" with { type: "file" };
import v9WalkSe4 from "../../public/assets/guests/v9/walk/se_04.png" with { type: "file" };
import v9WalkSe5 from "../../public/assets/guests/v9/walk/se_05.png" with { type: "file" };
import v9WalkSw0 from "../../public/assets/guests/v9/walk/sw_00.png" with { type: "file" };
import v9WalkSw1 from "../../public/assets/guests/v9/walk/sw_01.png" with { type: "file" };
import v9WalkSw2 from "../../public/assets/guests/v9/walk/sw_02.png" with { type: "file" };
import v9WalkSw3 from "../../public/assets/guests/v9/walk/sw_03.png" with { type: "file" };
import v9WalkSw4 from "../../public/assets/guests/v9/walk/sw_04.png" with { type: "file" };
import v9WalkSw5 from "../../public/assets/guests/v9/walk/sw_05.png" with { type: "file" };
import v9WalkNe0 from "../../public/assets/guests/v9/walk/ne_00.png" with { type: "file" };
import v9WalkNe1 from "../../public/assets/guests/v9/walk/ne_01.png" with { type: "file" };
import v9WalkNe2 from "../../public/assets/guests/v9/walk/ne_02.png" with { type: "file" };
import v9WalkNe3 from "../../public/assets/guests/v9/walk/ne_03.png" with { type: "file" };
import v9WalkNe4 from "../../public/assets/guests/v9/walk/ne_04.png" with { type: "file" };
import v9WalkNe5 from "../../public/assets/guests/v9/walk/ne_05.png" with { type: "file" };
import v9WalkNw0 from "../../public/assets/guests/v9/walk/nw_00.png" with { type: "file" };
import v9WalkNw1 from "../../public/assets/guests/v9/walk/nw_01.png" with { type: "file" };
import v9WalkNw2 from "../../public/assets/guests/v9/walk/nw_02.png" with { type: "file" };
import v9WalkNw3 from "../../public/assets/guests/v9/walk/nw_03.png" with { type: "file" };
import v9WalkNw4 from "../../public/assets/guests/v9/walk/nw_04.png" with { type: "file" };
import v9WalkNw5 from "../../public/assets/guests/v9/walk/nw_05.png" with { type: "file" };

import v10WalkSe0 from "../../public/assets/guests/v10/walk/se_00.png" with { type: "file" };
import v10WalkSe1 from "../../public/assets/guests/v10/walk/se_01.png" with { type: "file" };
import v10WalkSe2 from "../../public/assets/guests/v10/walk/se_02.png" with { type: "file" };
import v10WalkSe3 from "../../public/assets/guests/v10/walk/se_03.png" with { type: "file" };
import v10WalkSe4 from "../../public/assets/guests/v10/walk/se_04.png" with { type: "file" };
import v10WalkSe5 from "../../public/assets/guests/v10/walk/se_05.png" with { type: "file" };
import v10WalkSw0 from "../../public/assets/guests/v10/walk/sw_00.png" with { type: "file" };
import v10WalkSw1 from "../../public/assets/guests/v10/walk/sw_01.png" with { type: "file" };
import v10WalkSw2 from "../../public/assets/guests/v10/walk/sw_02.png" with { type: "file" };
import v10WalkSw3 from "../../public/assets/guests/v10/walk/sw_03.png" with { type: "file" };
import v10WalkSw4 from "../../public/assets/guests/v10/walk/sw_04.png" with { type: "file" };
import v10WalkSw5 from "../../public/assets/guests/v10/walk/sw_05.png" with { type: "file" };
import v10WalkNe0 from "../../public/assets/guests/v10/walk/ne_00.png" with { type: "file" };
import v10WalkNe1 from "../../public/assets/guests/v10/walk/ne_01.png" with { type: "file" };
import v10WalkNe2 from "../../public/assets/guests/v10/walk/ne_02.png" with { type: "file" };
import v10WalkNe3 from "../../public/assets/guests/v10/walk/ne_03.png" with { type: "file" };
import v10WalkNe4 from "../../public/assets/guests/v10/walk/ne_04.png" with { type: "file" };
import v10WalkNe5 from "../../public/assets/guests/v10/walk/ne_05.png" with { type: "file" };
import v10WalkNw0 from "../../public/assets/guests/v10/walk/nw_00.png" with { type: "file" };
import v10WalkNw1 from "../../public/assets/guests/v10/walk/nw_01.png" with { type: "file" };
import v10WalkNw2 from "../../public/assets/guests/v10/walk/nw_02.png" with { type: "file" };
import v10WalkNw3 from "../../public/assets/guests/v10/walk/nw_03.png" with { type: "file" };
import v10WalkNw4 from "../../public/assets/guests/v10/walk/nw_04.png" with { type: "file" };
import v10WalkNw5 from "../../public/assets/guests/v10/walk/nw_05.png" with { type: "file" };

export type GuestDir = "se" | "sw" | "ne" | "nw";

const STATIC_URLS: Record<number, Record<GuestDir, string>> = {
  1: { se: v1Se, sw: v1Sw, ne: v1Ne, nw: v1Nw },
  2: { se: v2Se, sw: v2Sw, ne: v2Ne, nw: v2Nw },
  3: { se: v3Se, sw: v3Sw, ne: v3Ne, nw: v3Nw },
  4: { se: v4Se, sw: v4Sw, ne: v4Ne, nw: v4Nw },
  5: { se: v5Se, sw: v5Sw, ne: v5Ne, nw: v5Nw },
  6: { se: v6Se, sw: v6Sw, ne: v6Ne, nw: v6Nw },
  7: { se: v7Se, sw: v7Sw, ne: v7Ne, nw: v7Nw },
  8: { se: v8Se, sw: v8Sw, ne: v8Ne, nw: v8Nw },
  9: { se: v9Se, sw: v9Sw, ne: v9Ne, nw: v9Nw },
  10: { se: v10Se, sw: v10Sw, ne: v10Ne, nw: v10Nw },
};

const WALK_FRAMES: Record<number, Record<GuestDir, string[]>> = {
  1: {
    se: [v1WalkSe0, v1WalkSe1, v1WalkSe2, v1WalkSe3, v1WalkSe4, v1WalkSe5],
    sw: [v1WalkSw0, v1WalkSw1, v1WalkSw2, v1WalkSw3, v1WalkSw4, v1WalkSw5],
    ne: [v1WalkNe0, v1WalkNe1, v1WalkNe2, v1WalkNe3, v1WalkNe4, v1WalkNe5],
    nw: [v1WalkNw0, v1WalkNw1, v1WalkNw2, v1WalkNw3, v1WalkNw4, v1WalkNw5],
  },
  3: {
    se: [v3WalkSe0, v3WalkSe1, v3WalkSe2, v3WalkSe3, v3WalkSe4, v3WalkSe5],
    sw: [v3WalkSw0, v3WalkSw1, v3WalkSw2, v3WalkSw3, v3WalkSw4, v3WalkSw5],
    ne: [v3WalkNe0, v3WalkNe1, v3WalkNe2, v3WalkNe3, v3WalkNe4, v3WalkNe5],
    nw: [v3WalkNw0, v3WalkNw1, v3WalkNw2, v3WalkNw3, v3WalkNw4, v3WalkNw5],
  },
  7: {
    se: [v7WalkSe0, v7WalkSe1, v7WalkSe2, v7WalkSe3, v7WalkSe4, v7WalkSe5],
    sw: [v7WalkSw0, v7WalkSw1, v7WalkSw2, v7WalkSw3, v7WalkSw4, v7WalkSw5],
    ne: [v7WalkNe0, v7WalkNe1, v7WalkNe2, v7WalkNe3, v7WalkNe4, v7WalkNe5],
    nw: [v7WalkNw0, v7WalkNw1, v7WalkNw2, v7WalkNw3, v7WalkNw4, v7WalkNw5],
  },
  2: {
    se: [v2WalkSe0, v2WalkSe1, v2WalkSe2, v2WalkSe3, v2WalkSe4, v2WalkSe5],
    sw: [v2WalkSw0, v2WalkSw1, v2WalkSw2, v2WalkSw3, v2WalkSw4, v2WalkSw5],
    ne: [v2WalkNe0, v2WalkNe1, v2WalkNe2, v2WalkNe3, v2WalkNe4, v2WalkNe5],
    nw: [v2WalkNw0, v2WalkNw1, v2WalkNw2, v2WalkNw3, v2WalkNw4, v2WalkNw5],
  },
  4: {
    se: [v4WalkSe0, v4WalkSe1, v4WalkSe2, v4WalkSe3, v4WalkSe4, v4WalkSe5],
    sw: [v4WalkSw0, v4WalkSw1, v4WalkSw2, v4WalkSw3, v4WalkSw4, v4WalkSw5],
    ne: [v4WalkNe0, v4WalkNe1, v4WalkNe2, v4WalkNe3, v4WalkNe4, v4WalkNe5],
    nw: [v4WalkNw0, v4WalkNw1, v4WalkNw2, v4WalkNw3, v4WalkNw4, v4WalkNw5],
  },
  5: {
    se: [v5WalkSe0, v5WalkSe1, v5WalkSe2, v5WalkSe3, v5WalkSe4, v5WalkSe5],
    sw: [v5WalkSw0, v5WalkSw1, v5WalkSw2, v5WalkSw3, v5WalkSw4, v5WalkSw5],
    ne: [v5WalkNe0, v5WalkNe1, v5WalkNe2, v5WalkNe3, v5WalkNe4, v5WalkNe5],
    nw: [v5WalkNw0, v5WalkNw1, v5WalkNw2, v5WalkNw3, v5WalkNw4, v5WalkNw5],
  },
  6: {
    se: [v6WalkSe0, v6WalkSe1, v6WalkSe2, v6WalkSe3, v6WalkSe4, v6WalkSe5],
    sw: [v6WalkSw0, v6WalkSw1, v6WalkSw2, v6WalkSw3, v6WalkSw4, v6WalkSw5],
    ne: [v6WalkNe0, v6WalkNe1, v6WalkNe2, v6WalkNe3, v6WalkNe4, v6WalkNe5],
    nw: [v6WalkNw0, v6WalkNw1, v6WalkNw2, v6WalkNw3, v6WalkNw4, v6WalkNw5],
  },
  8: {
    se: [v8WalkSe0, v8WalkSe1, v8WalkSe2, v8WalkSe3, v8WalkSe4, v8WalkSe5],
    sw: [v8WalkSw0, v8WalkSw1, v8WalkSw2, v8WalkSw3, v8WalkSw4, v8WalkSw5],
    ne: [v8WalkNe0, v8WalkNe1, v8WalkNe2, v8WalkNe3, v8WalkNe4, v8WalkNe5],
    nw: [v8WalkNw0, v8WalkNw1, v8WalkNw2, v8WalkNw3, v8WalkNw4, v8WalkNw5],
  },
  9: {
    se: [v9WalkSe0, v9WalkSe1, v9WalkSe2, v9WalkSe3, v9WalkSe4, v9WalkSe5],
    sw: [v9WalkSw0, v9WalkSw1, v9WalkSw2, v9WalkSw3, v9WalkSw4, v9WalkSw5],
    ne: [v9WalkNe0, v9WalkNe1, v9WalkNe2, v9WalkNe3, v9WalkNe4, v9WalkNe5],
    nw: [v9WalkNw0, v9WalkNw1, v9WalkNw2, v9WalkNw3, v9WalkNw4, v9WalkNw5],
  },
  10: {
    se: [v10WalkSe0, v10WalkSe1, v10WalkSe2, v10WalkSe3, v10WalkSe4, v10WalkSe5],
    sw: [v10WalkSw0, v10WalkSw1, v10WalkSw2, v10WalkSw3, v10WalkSw4, v10WalkSw5],
    ne: [v10WalkNe0, v10WalkNe1, v10WalkNe2, v10WalkNe3, v10WalkNe4, v10WalkNe5],
    nw: [v10WalkNw0, v10WalkNw1, v10WalkNw2, v10WalkNw3, v10WalkNw4, v10WalkNw5],
  },
};

const walkAnimKeyFor = (variant: number, dir: GuestDir) => `guest_v${variant}_walk_${dir}`;
const walkFrameKey = (variant: number, dir: GuestDir, idx: number) =>
  `${walkAnimKeyFor(variant, dir)}_${idx.toString().padStart(2, "0")}`;

export const guestStaticKey = (variant: number, dir: GuestDir) => `guest_v${variant}_${dir}`;

/** Animations available per variant — `null` for variants without walk frames. */
export const GUEST_WALK_ANIMS: Record<number, Record<GuestDir, string>> = Object.fromEntries(
  Object.keys(WALK_FRAMES).map((v) => {
    const n = Number(v);
    return [
      n,
      {
        se: walkAnimKeyFor(n, "se"),
        sw: walkAnimKeyFor(n, "sw"),
        ne: walkAnimKeyFor(n, "ne"),
        nw: walkAnimKeyFor(n, "nw"),
      },
    ];
  }),
);

export const GuestAssets = {
  preload(scene: Phaser.Scene) {
    for (let v = 1; v <= GUEST_VARIANT_COUNT; v++) {
      const dirs = STATIC_URLS[v];
      if (!dirs) continue;
      for (const d of ["se", "sw", "ne", "nw"] as GuestDir[]) {
        scene.load.image(guestStaticKey(v, d), dirs[d]);
      }
    }
    for (const [vStr, dirs] of Object.entries(WALK_FRAMES)) {
      const v = Number(vStr);
      for (const d of ["se", "sw", "ne", "nw"] as GuestDir[]) {
        const frames = dirs[d];
        for (let i = 0; i < frames.length; i++) {
          scene.load.image(walkFrameKey(v, d, i), frames[i]!);
        }
      }
    }
  },

  registerAnims(scene: Phaser.Scene) {
    for (const [vStr, dirs] of Object.entries(WALK_FRAMES)) {
      const v = Number(vStr);
      for (const d of ["se", "sw", "ne", "nw"] as GuestDir[]) {
        const key = walkAnimKeyFor(v, d);
        if (scene.anims.exists(key)) continue;
        const frames = dirs[d].map((_, i) => ({ key: walkFrameKey(v, d, i) }));
        scene.anims.create({ key, frames, frameRate: 10, repeat: -1 });
      }
    }
  },
};
