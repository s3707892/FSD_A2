// defines all graphql types, queries and mutations for the admin api
import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type Venue {
    venueId: Int!
    name: String!
    addressLine1: String
    addressLine2: String
    suburb: String
    postcode: String
    capacity: Int
    hourlyPrice: Float
    description: String
    active: Boolean
    featured: Boolean
    userId: Int
    vendorEmail: String
  }

  type Vendor {
    userId: Int!
    email: String!
  }

  type TopVenue {
    venueId: Int!
    name: String!
    bookingCount: Int!
    popularDay: String
    popularTimeSlot: String
  }

  type TopApplicant {
    userId: Int!
    email: String!
    totalApplications: Int!
    successfulBookings: Int!
  }

  type Query {
    venues: [Venue!]!
    venue(venueId: Int!): Venue
    vendors: [Vendor!]!
    topVenues: [TopVenue!]!
    topApplicants: [TopApplicant!]!
  }

  type Mutation {
    createVenue(
      name: String!
      addressLine1: String!
      addressLine2: String
      suburb: String!
      postcode: String!
      capacity: Int!
      hourlyPrice: Float!
      description: String!
      userId: Int!
    ): Venue

    updateVenue(
      venueId: Int!
      name: String
      addressLine1: String
      addressLine2: String
      suburb: String
      postcode: String
      capacity: Int
      hourlyPrice: Float
      description: String
      active: Boolean
    ): Venue

    deleteVenue(venueId: Int!): Boolean

    assignVendor(venueId: Int!, userId: Int!): Venue

    setFeatured(venueId: Int!, featured: Boolean!): Venue
  }
`;
