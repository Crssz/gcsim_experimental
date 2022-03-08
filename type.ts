export interface GCsimResult {
    v2: boolean;
    version: string;
    build_date: string;
    is_damage_mode: boolean;
    active_char: string;
    char_names: string[];
    damage_by_char: Damagebychar[];
    damage_instances_by_char: Damagebychar[];
    damage_by_char_by_targets: Damagebycharbytarget[];
    char_active_time: Value[];
    abil_usage_count_by_char: Abilusagecountbychar[];
    particle_count: Particlecount;
    reactions_triggered: Reactionstriggered;
    sim_duration: Value;
    ele_uptime: Eleuptime[];
    required_er?: any;
    damage: Value;
    dps: Value;
    dps_by_target: Damagebycharbytarget;
    damage_over_time: Damageovertime;
    iter: number;
    runtime: number;
    num_targets: number;
    char_details: Chardetail[];
    target_details: Targetdetail[];
    config_file: string;
    text: string;
    debug: string;
}

export interface Targetdetail {
    level: number;
}

export interface Chardetail {
    name: string;
    element: string;
    level: number;
    max_level: number;
    cons: number;
    weapon: Weapon;
    talents: Talents;
    sets: Sets;
    stats: number[];
    snapshot: number[];
}

export interface Sets {
    [k: string]: number;
}

export interface Talents {
    attack: number;
    skill: number;
    burst: number;
}

export interface Weapon {
    name: string;
    refine: number;
    level: number;
    max_level: number;
}

export interface Damageovertime {
    [k: string]: Value
}

export interface Eleuptime {
    [k: string]: Value;
}

export interface Reactionstriggered {
    [k: string]: Value;
}

export interface Particlecount {
    [k: string]: Value;
}

export interface Abilusagecountbychar {
    [k: string]: Value;
}

export interface Damagebycharbytarget {
    [k: string]: Value;
}

export interface Damagebychar {
    [k: string]: Value;
}

export interface Value {
    min: number;
    max: number;
    mean: number;
    sd: number;
}