import {StructureBuilder} from 'sanity/structure'
import {SchemaType} from '../consts/SchemaType'

export const structure = (S: StructureBuilder) => {
  return S.list()
    .title('CUDO Plays content')
    .items([
      ...S.documentTypeListItems(),
      S.divider(),
      S.listItem()
        .title('Games by season')
        .child(
          S.documentTypeList(SchemaType.Season)
            .title('Games by season')
            .child((seasonId) =>
              S.documentList()
                .apiVersion('2025-06-01')
                .title('Games')
                .filter('_type == $gameType && $seasonId == season._ref')
                .params({seasonId, gameType: SchemaType.Game})
            )
        ),
      S.listItem()
        .title('Games by award')
        .child(
          S.documentTypeList(SchemaType.Award)
            .title('Games by award')
            .child((awardId) =>
              S.documentList()
                .apiVersion('2025-06-01')
                .title('Award')
                .filter('_type == $gameType && $awardId in awards[]._ref || $awardId in runnerUpAwards[]._ref')
                .params({awardId: awardId, gameType: SchemaType.Game})
            )
        )
    ])
}