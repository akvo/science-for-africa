/**
 * Card Component Snapshot Tests
 *
 * Example snapshot tests to catch unintended UI changes.
 * Run `npm test -- -u` to update snapshots when intentional changes are made.
 */

import { render } from '@testing-library/react';

// Example Card component for snapshot testing
const Card = ({
  title,
  description,
  children,
}) => (
  <div className="bg-white p-6 rounded-xl shadow-lg">
    <h3 className="text-xl font-semibold mb-3 text-gray-900">{title}</h3>
    {description && <p className="text-gray-600">{description}</p>}
    {children}
  </div>
);

describe('Card Component Snapshots', () => {
  it('matches snapshot with title only', () => {
    const { container } = render(<Card title="Simple Card" />);

    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with title and description', () => {
    const { container } = render(
      <Card
        title="Feature Card"
        description="This is a description of the feature"
      />
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with children', () => {
    const { container } = render(
      <Card title="Card with Content">
        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
          Action Button
        </button>
      </Card>
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for feature grid layout', () => {
    const features = [
      { title: 'Strapi CMS', description: 'Headless CMS for content management' },
      { title: 'Next.js', description: 'React framework for production' },
      { title: 'PostgreSQL', description: 'Reliable database with PgAdmin' },
      { title: 'Mailpit', description: 'Email testing and development' },
    ];

    const { container } = render(
      <div className="grid md:grid-cols-4 gap-8">
        {features.map((feature) => (
          <Card key={feature.title} {...feature} />
        ))}
      </div>
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
