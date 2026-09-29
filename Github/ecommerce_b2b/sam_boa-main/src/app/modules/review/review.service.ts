import { paginationHelper } from "../../../helpars/paginationHelper"
import { IPaginationOptions } from "../../../interfaces/paginations"
import prisma from "../../../shared/prisma"

const addReview = async (userId: string, payload: {
  productId: string
  sellerId: string
  rating: number
  comment?: string
}) => {
  return prisma.review.create({
    data: {
      buyerId: userId,
      ...payload
    }
  })
}

const getAllReviews = async (
  options: IPaginationOptions
) => {
  const { skip, limit, page } = paginationHelper.calculatePagination(options)

  const result = await prisma.review.findMany(
    {
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          select: {
            id: true,
            productName: true,
            mainImage: true,
            subImages: true,
            setPrice: true,
            createdAt: true,
          },
        },
        buyer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
      },
    }
  )
  const total = await prisma.review.count()
  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  }
}

const getReviewsForProduct = async (productId: string) => {
  return prisma.review.findFirst({
    where: { productId },
    include: {
      product: {
        select: {
          id: true,
          productName: true,
          mainImage: true,
          subImages: true,
          setPrice: true,
          createdAt: true,
        },
      },
      buyer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          profileImage: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

const getReviewsForSeller = async (sellerId: string) => {
  return prisma.review.findMany({
    where: { sellerId },
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        select: {
          id: true,
          productName: true,
          mainImage: true,
          subImages: true,
          setPrice: true,
          createdAt: true,
        },
      },
      buyer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          profileImage: true,
          role: true,
        },
      },
    },
  });
};

export const ReviewService = {
  addReview,
  getAllReviews,
  getReviewsForProduct,
  getReviewsForSeller

}
