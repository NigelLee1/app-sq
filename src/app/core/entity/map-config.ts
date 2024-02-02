export const GIS_LAYERS = [
    {
        name: 'PS_LABELS',
        title: '注记',
        select: true,
        layers: 'jssq_syq:JSSQ_SYQ_LABELS',
        url: 'http://120.79.139.65/geoserver/jssq_syq/JSSQ_SYQ_LABELS/wms',
    },
    {
        name: 'PS_MANHOLE',
        title: '检查井',
        select: true,
        layers: 'jssq_syq:PS_MANHOLE',
        url: 'http://120.79.139.65/geoserver/jssq_syq/PS_MANHOLE/wms',
    }, {
        name: 'PS_VIRTUAL_POINT',
        title: '管线点',
        select: true,
        layers: 'jssq_syq:PS_VIRTUAL_POINT',
        url: 'http://120.79.139.65/geoserver/jssq_syq/PS_VIRTUAL_POINT/wms',
    },
    {
        name: 'PS_COMB',
        title: '雨水口',
        select: true,
        layers: 'jssq_syq:PS_COMB',
        url: 'http://120.79.139.65/geoserver/jssq_syq/PS_COMB/wms',
    }, {
        name: 'PS_OUTFALL',
        title: '排放口',
        select: true,
        layers: 'jssq_syq:PS_OUTFALL',
        url: 'http://120.79.139.65/geoserver/jssq_syq/PS_OUTFALL/wms',
    }, {
        name: 'PS_SEPTIC_TANK',
        title: '化粪池',
        select: true,
        layers: 'jssq_syq:PS_SEPTIC_TANK',
        url: 'http://120.79.139.65/geoserver/jssq_syq/PS_SEPTIC_TANK/wms',
    }, {
        name: 'PS_LINE_DIRECTION',
        title: '流向',
        select: true,
        layers: 'jssq_syq:PS_LINE_DIRECTION',
        url: 'http://120.79.139.65/geoserver/jssq_syq/PS_LINE_DIRECTION/wms',
    }, {
        name: 'PS_PIPE',
        title: '圆管',
        select: true,
        layers: 'jssq_syq:PS_PIPE',
        url: 'http://120.79.139.65/geoserver/jssq_syq/PS_PIPE/wms',
    }
    , {
        name: 'PS_CANAL',
        title: '渠箱',
        select: true,
        layers: 'jssq_syq:PS_CANAL',
        url: 'http://120.79.139.65/geoserver/jssq_syq/PS_CANAL/wms',
    }
];

export const FACILITY_TYPE = [
    {
        label: '检查井',
        value: '检查井'
    },
    {
        label: '圆管',
        value: '圆管'
    },
    {
        label: '雨水口',
        value: '雨水口'
    },
    {
        label: '排放口',
        value: '排放口'
    },
    {
        label: '渠箱',
        value: '渠箱'
    },
    {
        label: '其它',
        value: '其它'
    }
];

export const DRAIN_COVER = [
    {
        label: '井盖埋没',
        value: 'JGMM'
    },
    {
        label: '井盖丢失',
        value: 'JGZK_DS'
    },
    {
        label: '井框破损',
        value: 'JGZK_JKPS'
    },
    {
        label: '井盖破损',
        value: 'JGZK_PS'
    },
    {
        label: '盖框间隙',
        value: 'JGZK_JX'
    },
    {
        label: '盖框高差',
        value: 'JGZK_GKGC'
    },
    {
        label: '盖框突出或凹陷',
        value: 'JGZK_TCAX'
    },
    {
        label: '跳动和声响',
        value: 'JGZK_TDSX'
    },
    {
        label: '周边路面破损、沉降',
        value: 'JGZK_LMCJ'
    },
    {
        label: '井盖标示错误',
        value: 'JKZK_BSCW'
    },
    {
        label: '地面溢流',
        value: 'JGZK_DMYL'
    }
];

export const WELL_CONDITION_JCJ = [
    {
        label: '链条或锁具损坏',
        value: 'JNZK_SJSH'
    },
    {
        label: '爬梯松动、锈蚀或缺损',
        value: 'JNZK_PTSD'
    },
    {
        label: '井壁泥垢',
        value: 'JNZK_JBNG'
    },
    {
        label: '井壁裂缝',
        value: 'JNZK_JBLF'
    },
    {
        label: '井壁渗漏',
        value: 'JNZK_JBSR'
    },
    {
        label: '抹面脱落',
        value: 'JNZK_MMTL'
    },
    {
        label: '管口孔洞',
        value: 'JNZK_GKKD'
    },
    {
        label: '流槽破损',
        value: 'JNZK_LCPS'
    },
    {
        label: '井底积泥、杂物',
        value: 'JNZK_JDYN'
    },
    {
        label: '水流不畅',
        value: 'JNZK_SLBC'
    },
    {
        label: '浮渣',
        value: 'JNZK_FZ'
    },
    {
        label: '井筒变形',
        value: 'JNZK_JTBX'
    },
    {
        label: '接口密封',
        value: 'JNZK_JKMF'
    },
    {
        label: '防坠网',
        value: 'JNZK_FZW'
    },
    {
        label: '管口破裂',
        value: 'JNZK_GKPL'
    },
    {
        label: '树根侵入',
        value: 'JNZK_SGZR'
    },
    {
        label: '塌陷',
        value: 'JNZK_TX'
    }
];

export const WELL_CONDITION_YSK = [
    {
        label: '链条或锁具损坏',
        value: 'JNZK_LTSH'
    },
    {
        label: '裂缝或渗漏',
        value: 'JNZK_LF'
    },
    {
        label: '抹面脱落',
        value: 'JNZK_MMTL'
    },
    {
        label: '积泥或杂物',
        value: 'JNZK_YN'
    },
    {
        label: '水流受阻',
        value: 'JNZK_SLSZ'
    },
    {
        label: '私接连管',
        value: 'JNZK_SJLG'
    },
    {
        label: '井体倾斜',
        value: 'JNZK_JTQX'
    },
    {
        label: '连管异常',
        value: 'JNZK_LGYC'
    },
    {
        label: '防坠网',
        value: 'JNZK_FZW'
    },
    {
        label: '管口破裂',
        value: 'JNZK_GKPL'
    },
    {
        label: '树根侵入',
        value: 'JNZK_SGQR'
    },
    {
        label: '塌陷',
        value: 'JNZK_TX'
    }
];

export const RAIN_WATER_GRATE = [
    {
        label: '雨水箅丢失',
        value: 'YSBZK_DS'
    },
    {
        label: '雨水箅破损',
        value: 'YSBZK_PS'
    },
    {
        label: '雨水口框破损',
        value: 'YSBZK_KGPX'
    },
    {
        label: '盖框间隙',
        value: 'YSBZK_GKJX'
    },
    {
        label: '盖框高差',
        value: 'YSBZK_GKGC'
    },
    {
        label: '孔眼堵塞',
        value: 'YSBZK_KYDS'
    },
    {
        label: '雨水口框突出',
        value: 'YSBZK_YSKKTC'
    },
    {
        label: '异臭',
        value: 'YSBZK_YC'
    },
    {
        label: '路面沉降或积水',
        value: 'YSBZK_LMCJ'
    },
    {
        label: '地面溢流',
        value: 'YSBZK_DMYL'
    }
];

export const EXIST_PROBLEM = [
    {
        label: '堵塞',
        value: 'CZWT_DS'
    },
    {
        label: '破损',
        value: 'CZWT_PS'
    },
    {
        label: '旱天污水溢流',
        value: 'CZWT_HTWSLY'
    },
    {
        label: '涌水倒灌',
        value: 'CZWT_CSDG'
    }
];

export const EXIST_PROBLEM_PM = [
    {
        label: '损坏',
        value: 'CZWT_SH'
    },
    {
        label: '漏水',
        value: 'CZWT_LS'
    },
    {
        label: '涌水倒灌',
        value: 'CZWT_CSDG'
    }
];

export const EXIST_PROBLEM_XH = [
    {
        label: '路面破损、沉降',
        value: 'CZWT_LMPSCJ'
    },
    {
        label: '通气设施损坏、堵塞',
        value: 'CZWT_TQSSSHDS'
    },
    {
        label: '侵占骑压',
        value: 'CZWT_QZQY'
    },
    {
        label: '淤积',
        value: 'CZWT_YJ'
    }
];

export const EXIST_PROBLEM_SZ = [
    {
        label: '损坏',
        value: 'CZWT_SH'
    },
    {
        label: '漏水',
        value: 'CZWT_LS'
    },
    {
        label: '浮渣',
        value: 'CZWT_FZ'
    }
];

export const EXIST_PROBLEM_HC = [
    {
        label: '淤积',
        value: 'CZWT_YJ'
    },
    {
        label: '栏杆损坏',
        value: 'CZWT_LGSH'
    },
    {
        label: '标识牌被涂画、损坏',
        value: 'CZWT_BSPBTHSH'
    },
    {
        label: '水质黑臭',
        value: 'CZWT_SZHC'
    },
    {
        label: '挡墙损坏',
        value: 'CZWT_DQSH'
    }
];
