import { Box, Image, Stack, Text } from '@qwant/qwant-ponents';
import React from 'react';
import { useI18n } from 'src/hooks';
import { findBlock } from 'src/libs/pois';
import { Divider } from 'src/components/ui';

const UserReviewsBlock = ({ poi }) => {
  const { _ } = useI18n();
  const blocks = poi.blocks;
  const userReviewsBlock = findBlock(blocks, 'reviews');

  const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });

  const truncate = (string, length) => {
    if (string.length <= length) return string;
    string = string.substr(0, length);
    string = string.replace(/\s+\S+?\.*$/, '');
    return string + '...';
  };

  if (!userReviewsBlock || userReviewsBlock?.reviews?.length === 0) {
    return null;
  } else {
    userReviewsBlock.reviews.map(item => (item.date = dateFormatter.format(new Date(item.date))));

    return (
      <>
        <Divider paddingTop={0} />
        <Stack gap="xs">
          <h3 className="u-text--smallTitle">{_('Reviews')}</h3>
          <Stack gap="xs">
            {userReviewsBlock.reviews.map(({ date, text, url, rating, rating_bubble_star_url }) => (
              <Box key={url}>
                <Text typo="caption-1" color="secondary" className="UserReviewCaption">
                  <Image
                    src={rating_bubble_star_url}
                    fallbackImageSrc={`./statics/images/tripadvisor/${rating}.svg`}
                    width={85}
                    height={15}
                  />
                  <Text typo="caption-1">
                    {date}
                    &nbsp;·&nbsp;{_('TripAdvisor user')}
                  </Text>
                </Text>
                <Text className="UserReviewDescription" color="primary" typo="body-2">
                  {truncate(text, 150)}
                  &nbsp;
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    <Text typo="body-2" color="action-link">
                      {_('Read the full review')}
                    </Text>
                  </a>
                </Text>
              </Box>
            ))}
          </Stack>
          <a
            className="UserReviewReadMore"
            href={userReviewsBlock.reviews[0].more_reviews_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Text typo="body-2" color="action-link">
              {_('Read more reviews on TripAdvisor')}
            </Text>
          </a>
        </Stack>
      </>
    );
  }
};

export default UserReviewsBlock;
