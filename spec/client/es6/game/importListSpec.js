describe('game import list', function() {
  describe('gameFactionsService', function() {
    beforeEach(inject([ 'gameFactions', function(gameFactionsService) {
      this.gameFactionsService = gameFactionsService;
    }]));

    when('buildModelsList(<list>, <user>, <references>)', function() {
      this.ret = this.gameFactionsService
        .buildModelsList(this.list, this.user, this.references);
    }, function() {
      beforeEach(function() {
        this.list = '';
        this.user = 'toto';
        this.references = {};
      });

      it('should init base object empty list', function() {
        expect(this.ret.base).toEqual({
          x: 240, y: 240, r: 0
        });
      });

      using([
        [ 'desc', 'references', 'list', 'models' ],
        [ 'default', {}          , ''    , []       ],
        //#####################################
        //#####################################
        //#####################################
        [ 'simple reference',
          {
            'reference': {
              entries: { default: [ { path: 'info',
                                      base_radius: 7 }
                                  ]
                       }
            },
          }, [
            'reference',
            // ignore case
            'Reference',
            // can start with *
            '* Reference',
            // can ends with anything
            'Reference whatever',
          ].join('\n'), [
            { user: 'toto', info: 'info', x:  7, y: 7, r: 0, u: 1 },
            // increments x by 2*base_radius
            { user: 'toto', info: 'info', x: 21, y: 7, r: 0, u: 2 },
            // increment unit number when no unit name
            { user: 'toto', info: 'info', x: 35, y: 7, r: 0, u: 3 },
            { user: 'toto', info: 'info', x: 49, y: 7, r: 0, u: 4 },
          ]
        ],
        //#####################################
        //#####################################
        //#####################################
        [ 'repeated reference',
          {
            'reference': {
              entries: { default: [ { path: 'info',
                                      // special key fk_repeat
                                      fk_repeat: 3,
                                      base_radius: 7 }
                                  ]
                       }
            },
          }, [
            'reference',
          ].join('\n'), [
            // repeat models fk_repeat times
            { user: 'toto', info: 'info', x:  7, y: 7, r: 0, u: 1 },
            // does not increment unit number
            { user: 'toto', info: 'info', x: 21, y: 7, r: 0, u: 1 },
            { user: 'toto', info: 'info', x: 35, y: 7, r: 0, u: 1 },
          ]
        ],
        //#####################################
        //#####################################
        //#####################################
        [ 'reference with counter',
          {
            '(?<nb_repeat>\\d+) references?': {
              entries: { default: [ { path: 'info',
                                      // special key fk_repeat
                                      fk_repeat: 3,
                                      base_radius: 7 }
                                  ]
                       }
            },
          }, [
            '4 references',
          ].join('\n'), [
            // repeat models nb_repeat times
            { user: 'toto', info: 'info', x:  7, y: 7, r: 0, u: 1 },
            { user: 'toto', info: 'info', x: 21, y: 7, r: 0, u: 1 },
            { user: 'toto', info: 'info', x: 35, y: 7, r: 0, u: 1 },
            { user: 'toto', info: 'info', x: 49, y: 7, r: 0, u: 1 },
          ]
        ],
        //#####################################
        //#####################################
        //#####################################
        [ 'simple unit',
          {
            'unit (?<nb_grunts>\\d+)': {
              entries: { grunt: [ { path: 'grunt',
                                    unit_name: 'unit',
                                    base_radius: 7 }
                                ]
                       }
            },
          }, [
            'unit 5',
          ].join('\n'), [
            // first model is a leader
            { user: 'toto', info: 'grunt', x:  7, y: 7, r: 0, dsp: [ 'l', 'i' ], u: 1 },
            // unit counter does not increase
            { user: 'toto', info: 'grunt', x: 21, y: 7, r: 0, u: 1 },
            { user: 'toto', info: 'grunt', x: 35, y: 7, r: 0, u: 1 },
            { user: 'toto', info: 'grunt', x: 49, y: 7, r: 0, u: 1 },
            { user: 'toto', info: 'grunt', x: 63, y: 7, r: 0, u: 1 },
            // create ng_grunts+1 models
            { user: 'toto', info: 'grunt', x: 77, y: 7, r: 0, u: 1 },
          ]
        ],
        //#####################################
        //#####################################
        //#####################################
        [ 'simple unit consecutive',
          {
            'unit (?<nb_grunts>\\d+)': {
              entries: { grunt: [ { path: 'grunt',
                                    unit_name: 'unit',
                                    base_radius: 7 }
                                ]
                       }
            },
          }, [
            'unit 5',
            'unit 2',
          ].join('\n'), [
            { user: 'toto', info: 'grunt', x:  7, y: 7, r: 0, dsp: [ 'l', 'i' ], u: 1 },
            { user: 'toto', info: 'grunt', x: 21, y: 7, r: 0, u: 1 },
            { user: 'toto', info: 'grunt', x: 35, y: 7, r: 0, u: 1 },
            { user: 'toto', info: 'grunt', x: 49, y: 7, r: 0, u: 1 },
            { user: 'toto', info: 'grunt', x: 63, y: 7, r: 0, u: 1 },
            { user: 'toto', info: 'grunt', x: 77, y: 7, r: 0, u: 1 },
            { user: 'toto', info: 'grunt', x: 91, y: 7, r: 0, dsp: [ 'l', 'i' ], u: 2 },
            { user: 'toto', info: 'grunt', x: 105, y: 7, r: 0, u: 2 },
            { user: 'toto', info: 'grunt', x: 119, y: 7, r: 0, u: 2 },
          ]
        ],
        //#####################################
        //#####################################
        //#####################################
        [
          'unit with leader model',
          {
            'unit (?<nb_grunts>\\d+)': {
              entries: { grunt: [ { path: 'grunt',
                                    unit_name: 'unit',
                                    base_radius: 7 }
                                ],
                         leader: [ { path: 'leader',
                                     unit_name: 'unit',
                                     base_radius: 12 }
                                 ]
                       }
            },
          }, [
            'unit 2',
          ].join('\n'), [
            // first model use the leader info
            { user: 'toto', info: 'leader', x: 12, y: 12, r: 0, dsp: [ 'l', 'i' ], u: 1 },
            // other models use the grunt info
            { user: 'toto', info: 'grunt', x: 31, y: 7, r: 0, u: 1 },
            { user: 'toto', info: 'grunt', x: 45, y: 7, r: 0, u: 1 },
          ]
        ],
        //#####################################
        //#####################################
        //#####################################
        [
          'unit with predefined size',
          {
            'unit': {
              entries: { grunt: [ { path: 'grunt',
                                    // includes special key fk_grunts = unit size (inc. leader)
                                    fk_grunts: 3,
                                    unit_name: 'unit',
                                    base_radius: 7 }
                                ]
                       }
            },
          }, [
            'unit',
          ].join('\n'), [
            // creates predefined number of grunts
            { user: 'toto', info: 'grunt', x: 7, y: 7, r: 0, dsp: [ 'l', 'i' ], u: 1 },
            { user: 'toto', info: 'grunt', x: 21, y: 7, r: 0, u: 1 },
            { user: 'toto', info: 'grunt', x: 35, y: 7, r: 0, u: 1 },
          ]
        ],
        //#####################################
        //#####################################
        //#####################################
        [ 'unit with extra models',
          {
            'unit (?<nb_grunts>\\d+)': {
              entries: { grunt: [ { path: 'grunt',
                                    unit_name: 'unit',
                                    base_radius: 7 }
                                ],
                         other: [ { path: 'other',
                                    unit_name: 'unit',
                                    base_radius: 7 }
                                ]
                       }
            },
          }, [
            'unit 1',
          ].join('\n'), [
            // first model is a leader
            { user: 'toto', info: 'grunt', x:  7, y: 7, r: 0, dsp: [ 'l', 'i' ], u: 1 },
            { user: 'toto', info: 'grunt', x: 21, y: 7, r: 0, u: 1 },
            // should append extra models
            { user: 'toto', info: 'other', x: 35, y: 7, r: 0, u: 1 },
          ]
        ],
        //#####################################
        //#####################################
        //#####################################
        [ 'character unit',
          {
            'unit': {
              entries: { charac1: [ { path: 'charac1',
                                      unit_name: 'unit',
                                      base_radius: 7 }
                                  ],
                         charac2: [ { path: 'charac2',
                                      unit_name: 'unit',
                                      base_radius: 7 }
                                  ],
                         charac3: [ { path: 'charac3',
                                      unit_name: 'unit',
                                      base_radius: 7 }
                                  ],
                       }
            },
          }, [
            'unit',
          ].join('\n'), [
            { user: 'toto', info: 'charac1', x:  7, y: 7, r: 0, u: 1 },
            { user: 'toto', info: 'charac2', x: 21, y: 7, r: 0, u: 1 },
            { user: 'toto', info: 'charac3', x: 35, y: 7, r: 0, u: 1 },
          ]
        ],
        //#####################################
        //#####################################
        //#####################################
        [ 'unit with attachements',
          {
            'unit (?<nb_grunts>\\d+)': {
              entries: { grunt: [ { path: 'grunt',
                                    unit_name: 'unit',
                                    base_radius: 7 }
                                ]
                       }
            },
            '(?<nb_repeat>\\d+) unit_wa': {
              entries: { wa: [ { path: 'wa',
                                 unit_name: 'unit',
                                 base_radius: 7 }
                             ]
                       }
            },
            'unit_ua': {
              entries: { officer: [ { path: 'officer',
                                      unit_name: 'unit',
                                      base_radius: 7 }
                                  ],
                         standard: [ { path: 'standard',
                                       unit_name: 'unit',
                                       base_radius: 7 }
                                   ]
                       }
            },
            'other_unit (?<nb_grunts>\\d+)': {
              entries: { grunt: [ { path: 'other_grunt',
                                    unit_name: 'other_unit',
                                    base_radius: 7 }
                                ]
                       }
            },
            'solo': {
              entries: { default: [ { path: 'solo',
                                      // no unit name
                                      base_radius: 7 }
                                  ]
                       }
            },
          }, [
            'unit 1',
            '* 2 unit_wa',
            '* unit_ua',
            'unit 1',
            'other_unit 2',
            'solo',
          ].join('\n'), [
            // create first unit normally
            { user: 'toto', info: 'grunt', x: 7, y: 7, r: 0, dsp: [ 'l', 'i' ], u: 1 },
            { user: 'toto', info: 'grunt', x: 21, y: 7, r: 0, u: 1 },
            // does not increment unit number on new ref with same unit name
            { user: 'toto', info: 'wa', x: 35, y: 7, r: 0, u: 1 },
            { user: 'toto', info: 'wa', x: 49, y: 7, r: 0, u: 1 },
            // does not increment unit number on new ref with same unit name
            { user: 'toto', info: 'officer', x: 63, y: 7, r: 0, u: 1 },
            { user: 'toto', info: 'standard', x: 77, y: 7, r: 0, u: 1 },
            // increment unit number on same consecutive unit
            { user: 'toto', info: 'grunt', x: 91, y: 7, r: 0, dsp: [ 'l', 'i' ], u: 2 },
            { user: 'toto', info: 'grunt', x: 105, y: 7, r: 0, u: 2 },
            // increments unit number on new ref with different unit name
            { user: 'toto', info: 'other_grunt', x: 119, y: 7, r: 0, dsp: [ 'l', 'i' ], u: 3 },
            { user: 'toto', info: 'other_grunt', x: 133, y: 7, r: 0, u: 3 },
            { user: 'toto', info: 'other_grunt', x: 147, y: 7, r: 0, u: 3 },
            // increments unit number on ref without unit name
            { user: 'toto', info: 'solo', x: 161, y: 7, r: 0, u: 4 },
          ]
        ],
        //#####################################
        //#####################################
        //#####################################
        [ 'line break',
          {
            '(?<nb_repeat>\\d+) references?': {
              entries: { default: [ { path: 'info',
                                      // special key fk_repeat
                                      fk_repeat: 3,
                                      base_radius: 20 }
                                  ]
                       }
            },
          }, [
            '8 references',
          ].join('\n'), [
            { user: 'toto', info: 'info', x:  20, y: 20, r: 0, u: 1 },
            { user: 'toto', info: 'info', x:  60, y: 20, r: 0, u: 1 },
            { user: 'toto', info: 'info', x: 100, y: 20, r: 0, u: 1 },
            { user: 'toto', info: 'info', x: 140, y: 20, r: 0, u: 1 },
            { user: 'toto', info: 'info', x: 180, y: 20, r: 0, u: 1 },
            { user: 'toto', info: 'info', x: 220, y: 20, r: 0, u: 1 },
            { user: 'toto', info: 'info', x: 260, y: 20, r: 0, u: 1 },
            // breaks line above x = 240
            // increment y by 2*base_radius
            { user: 'toto', info: 'info', x:  20, y: 60, r: 0, u: 1 },
          ]
        ],
      ], function(e) {
        beforeEach(function() {
          R.forEach((key) => {
            e.references[key].regexp = this.gameFactionsService
              .buildReferenceRegexp(key);
          }, R.keys(e.references));
        });
        
        when(e.desc, function() {
          this.references = e.references;
          this.list = e.list;
        }, function() {
          it('should create model info list', function() {
            expect(this.ret.models)
              .toEqual(e.models);
          });
        });
      });
    });
  });
});
