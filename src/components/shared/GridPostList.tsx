import React from 'react';
import {Models} from "appwrite";
import {useUserContext} from "@/context/AuthContext";
import {Link} from "react-router-dom";
import PostStats from "./PostStats";

type GridPostListProps = {
	posts: Models.Document[];
	showUser?: boolean;
	showStats?: boolean;
}

const GridPostList = ({posts, showUser = true, showStats = true}: GridPostListProps) => {
	const { user } = useUserContext()

	return (
			<ul className="grid-container">
				{posts.map((post) => (
						<li key={post.$id} className="relative min-w-80 h-80">
							<Link to={`/posts/${post.$id}`} className="grid-post_link">
								<img
										className="h-full w-full object-cover"
										src={post.imageUrl}
										alt="image"
								/>
							</Link>

							<div className="grid-post_user">
								{showUser && (
										<div className="flex items-center justify-start gap-2 flex-1">
											<img
													className="h-8 w-8 rounded-full"
													src={post.creator.imageUrl}
													alt="creator"
											/>
											<p className="line-clamp-1">{post.creator.name}</p>
										</div>
								)}
								{showStats && <PostStats userId={user.id} post={post} />}
							</div>
						</li>
				))}
			</ul>
	);
};

export default GridPostList;